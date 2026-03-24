module Api
  module V1
    class MatchesController < BaseController
      def index
        matches = fetch_matches
        render_success(MatchSerializer.new(matches).serializable_hash, meta: pagination_meta)
      end

      def show
        render_success MatchSerializer.new(match).serializable_hash
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

        matches = Match.h2h(team1_id, team2_id)
                       .includes(:home_team, :away_team, :league)
                       .limit(10)

        render_success MatchSerializer.new(matches).serializable_hash
      end

      def lineups
        render json: { data: match.match_lineups }
      end

      def events
        render json: { data: match.match_events.order(:time) }
      end

      def statistics
        render json: { data: match.match_statistics }
      end

      def highlights
        render_success HighlightSerializer.new(match.highlights).serializable_hash
      end

      private

      def match
        @match ||= Match.includes(:home_team, :away_team, :league).find(params[:id])
      end

      def fetch_matches
        scope = Match.includes(:home_team, :away_team, :league)
        scope = scope.where(league_id: params[:league_id])   if params[:league_id].present?
        scope = scope.where('date::date = ?', params[:date]) if params[:date].present?
        scope = apply_status_scope(scope)                    if valid_status_scope?
        paginate(scope.order(date: :asc))
      end
    end
  end
end
