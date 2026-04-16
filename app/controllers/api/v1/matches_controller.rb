module Api
  module V1
    class MatchesController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[index show live h2h lineups events statistics highlights box_scores predictions shots news last_five injuries bookmakers]

      def index
        matches = MatchQueries::MatchesListQuery.new(params[:league_id], params[:date]).call
        matches = apply_status_scope(matches) if valid_status_scope?
        paginate(matches.order(date: :asc))

        render_success(MatchSerializer.new(matches, include: [ :home_team, :away_team, :league ]).serializable_hash, meta: pagination_meta)
      end

      def show
        result = CacheService::Store.fetch(CacheService::Keys.match(params[:id]), ttl: CacheService::Ttl::MIN_5) do
          {
            data: MatchSerializer.new(match, include: [ :home_team, :away_team, :league ]).serializable_hash,
            meta: {
              standings:     MatchQueries::StandingsQuery.new(match).call,
              home_stat:     team_stat_data(match.home_team_id),
              away_stat:     team_stat_data(match.away_team_id),
              player_id_map: MatchQueries::PlayerIdMapQuery.new(match).call
            }
          }
        end

        render json: result
      end

      def live
        matches = CacheService::Store.fetch(CacheService::Keys.live_matches, ttl: CacheService::Ttl::LIVE) do
          Match.live.includes(:home_team, :away_team, :league).as_json(include: %i[home_team away_team league])
        end

        render json: { data: matches }
      end

      def h2h
        team1_id = params.require(:team1_id)
        team2_id = params.require(:team2_id)
        data     = MatchQueries::H2hQuery.new(team1_id, team2_id).call

        render json: { data: data }
      end

      def lineups
        query  = MatchQueries::LineupsQuery.new(match)
        result = CacheService::Store.fetch(CacheService::Keys.match_lineup(params[:id]), ttl: query.ttl_key) do
          query.call
        end

        render json: result
      end

      def last_five
        home = MatchQueries::LastFiveQuery.new(match, match.home_team).call
        away = MatchQueries::LastFiveQuery.new(match, match.away_team).call

        render json: { data: { home: home, away: away } }
      end

      def injuries
        home_injuries = MatchQueries::InjuriesQuery.new(match.home_team).call
        away_injuries = MatchQueries::InjuriesQuery.new(match.away_team).call

        render json: { data: { home: home_injuries, away: away_injuries } }
      end

      def bookmakers
        cache_key = "match_odds:#{match.external_id}"
        cached    = RedisService.get(cache_key)

        if cached
          render json: { data: JSON.parse(cached) }
          return
        end

        raw    = Highlightly::Client.new.odds(matchId: match.external_id, oddsType: 'prematch')
        nested = raw.is_a?(Hash) ? Array(raw['data']) : []
        data   = nested.flat_map { |entry| Array(entry['odds']) }
        RedisService.set(cache_key, data.to_json, ex: 1.hour.to_i)

        render json: { data: data }
      rescue Highlightly::Error
        render json: { data: [] }
      end

      def events
        result = CacheService::Store.fetch(CacheService::Keys.match_events(params[:id]), ttl: CacheService::Ttl::MIN_5) do
          player_map = MatchQueries::PlayerIdMapQuery.new(match).call
          data = match.match_events.order(:time).map do |event|
            player_info           = player_map[event.player_external_id]
            assisting_player_info = player_map[event.assisting_player_external_id]

            events_map(event, player_info, assisting_player_info)
          end

          { data: data }
        end

        render json: result
      end

      def statistics
        result = CacheService::Store.fetch(CacheService::Keys.match_statistics(params[:id]), ttl: CacheService::Ttl::MIN_5) do
          { data: match.match_statistics }
        end

        render json: result
      end

      def highlights
        country = params[:country_code].to_s.upcase.presence
        highlights = MatchQueries::HighlightsQuery.new(match, country).call

        render_success HighlightSerializer.new(highlights).serializable_hash
      end

      def predictions
        live     = MatchPrediction.latest_live(match.id)
        prematch = MatchPrediction.latest_prematch(match.id)

        render json: {
          data: {
            live:     live     ? prediction_json(live) : nil,
            prematch: prematch ? prediction_json(prematch) : nil
          }
        }
      end

      def shots
        data = MatchQueries::ShotsQuery.new(match).call

        render json: { data: data }
      end

      def news
        articles = match.match_news_items.recent.limit(20)
        render json: { data: articles.as_json }
      end

      def box_scores
        result = CacheService::Store.fetch(CacheService::Keys.match_box_scores(params[:id]), ttl: CacheService::Ttl::MIN_5) do
          MatchQueries::BoxScoresQuery.new(full_match).call
        end
        render json: result
      end

      private

      def match
        @match ||= Match.includes(:home_team, :away_team, :league, :match_events, :match_lineups).find(params[:id])
      end

      def full_match
        @full_match ||= Match.includes(
          :home_team, :away_team, :league,
          :match_events, :match_lineups, { box_scores: :player }
        ).find(params[:id])
      end

      def team_stat_data(team_id)
        season = match.league.seasons.max
        TeamStatistic.find_by(team_id: team_id, season: season)&.as_json
      end

      def prediction_json(prediction)
        {
          home_pct:     prediction.home_pct,
          draw_pct:     prediction.draw_pct,
          away_pct:     prediction.away_pct,
          generated_at: prediction.generated_at
        }
      end

      def events_map(event, player_info, assisting_player_info)
        {
          id:                           event.id,
          time:                         event.time,
          team_name:                    event.team_name,
          event_type:                   event.event_type,
          player_name:                  event.player_name,
          team_external_id:             event.team_external_id,
          substituted_player:           event.substituted_player,
          player_external_id:           event.player_external_id,
          assisting_player_name:        event.assisting_player_name,
          assisting_player_external_id: event.assisting_player_external_id,
          player_path:                  player_info ? "/players/#{player_info[:id]}" : nil,
          assisting_player_path:        assisting_player_info ? "/players/#{assisting_player_info[:id]}" : nil
        }
      end
    end
  end
end
