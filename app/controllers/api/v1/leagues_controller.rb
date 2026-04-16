module Api
  module V1
    class LeaguesController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[index show standings top_scorers]

      def index
        leagues = LeagueQueries::LeaguesListQuery.new(params[:country_code], params[:name]).call
        paginated_leagues = paginate(leagues.order(:name))

        render_success(LeagueSerializer.new(paginated_leagues).serializable_hash, meta: pagination_meta)
      end

      def show
        available_seasons = Standing.where(league: league).distinct.pluck(:season).sort.reverse

        render_success LeagueSerializer.new(league).serializable_hash,
                       meta: { available_seasons: available_seasons }
      end

      def standings
        render json: fetch_standings_json
      end

      def top_scorers
        top_scorers = CacheService::Store.fetch(CacheService::Keys.top_scorers(league.id, season), ttl: CacheService::Ttl::MIN_30) do
          LeagueQueries::LeaguesListQuery.new(league, season).call
        end

        render_success PlayerSerializer.new(top_scorers).serializable_hash
      end

      private

      def league
        @league ||= League.includes(:country).find(params[:id])
      end

      def season
        @season ||= params[:season]&.to_i
      end

      def fetch_standings_json
        return { data: [] } unless season

        CacheService::Store.fetch(CacheService::Keys.league_standings(league.id, season), ttl: CacheService::Ttl::MIN_30) do
          records = Standing.where(league: league, season: season).includes(:team).ordered
          StandingSerializer.new(records, include: [ :team ]).serializable_hash
        end
      end
    end
  end
end
