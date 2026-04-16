module Interactors
  module CacheWarmup
    class TodayMatchDetails < Interactors::Base
      def call
        matches = Match.includes(:home_team, :away_team, :league, :match_events, :match_lineups)
                       .where('date::date = ? OR status IN (?)', Date.today, MatchConstants::LIVE_STATUSES)
        count = 0
        matches.each { |m| warm_match(m); count += 1 }
        log "Warmed details for #{count} matches"
      end

      private

      def warm_match(match)
        warm_show(match)
        warm_events(match)
        warm_box_scores(match)
      end

      def warm_show(match)
        key = CacheService::Keys.match(match.id)
        return if CacheService::Store.exists?(key)

        CacheService::Store.write(key, {
          data: MatchSerializer.new(match, include: [ :home_team, :away_team, :league ]).serializable_hash,
          meta: {
            standings:     MatchQueries::StandingsQuery.new(match).call,
            home_stat:     team_stat_data(match, match.home_team_id),
            away_stat:     team_stat_data(match, match.away_team_id),
            player_id_map: MatchQueries::PlayerIdMapQuery.new(match).call
          }
        }, ttl: CacheService::Ttl::MIN_5)
      end

      def warm_events(match)
        key = CacheService::Keys.match_events(match.id)
        return if CacheService::Store.exists?(key)

        player_map = MatchQueries::PlayerIdMapQuery.new(match).call
        data = match.match_events.order(:time).map do |e|
          pi  = player_map[e.player_external_id]
          api = player_map[e.assisting_player_external_id]
          {
            id:                           e.id,
            time:                         e.time,
            event_type:                   e.event_type,
            player_name:                  e.player_name,
            player_external_id:           e.player_external_id,
            player_path:                  pi  ? "/players/#{pi[:id]}"  : nil,
            assisting_player_name:        e.assisting_player_name,
            assisting_player_external_id: e.assisting_player_external_id,
            assisting_player_path:        api ? "/players/#{api[:id]}" : nil,
            substituted_player:           e.substituted_player,
            team_name:                    e.team_name,
            team_external_id:             e.team_external_id
          }
        end
        CacheService::Store.write(key, { data: data }, ttl: CacheService::Ttl::MIN_5)
      end

      def warm_box_scores(match)
        key = CacheService::Keys.match_box_scores(match.id)
        return if CacheService::Store.exists?(key)

        full_match = Match.includes(
          :home_team, :away_team, :match_events, :match_lineups, { box_scores: :player }
        ).find(match.id)
        CacheService::Store.write(key, MatchQueries::BoxScoresQuery.new(full_match).call,
                                  ttl: CacheService::Ttl::MIN_5)
      end

      def team_stat_data(match, team_id)
        TeamStatistic.find_by(team_id: team_id, season: match.league.seasons.max)&.as_json
      end
    end
  end
end
