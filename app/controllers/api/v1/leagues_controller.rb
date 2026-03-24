module Api
  module V1
    class LeaguesController < BaseController
      def index
        leagues = fetch_leagues
        render_success(LeagueSerializer.new(leagues).serializable_hash, meta: pagination_meta)
      end

      def show
        render_success LeagueSerializer.new(league).serializable_hash
      end

      def standings
        standings = fetch_standings
        render_success StandingSerializer.new(standings).serializable_hash
      end

      def top_scorers
        players = fetch_top_scorers
        render_success PlayerSerializer.new(players).serializable_hash
      end

      private

      def league
        @league ||= League.includes(:country).find(params[:id])
      end

      def season
        @season ||= params.fetch(:season, Date.today.year).to_i
      end

      def fetch_leagues
        scope = League.includes(:country)
        scope = scope.by_country(params[:country_code])           if params[:country_code].present?
        scope = scope.where('name ILIKE ?', "%#{params[:name]}%") if params[:name].present?
        paginate(scope.order(:name))
      end

      def fetch_standings
        CacheService::Store.fetch(CacheService::Keys.league_standings(league.id, season), ttl: CacheService::Ttl::MIN_30) do
          Standing.where(league: league, season: season)
                  .includes(:team)
                  .ordered
        end
      end

      def fetch_top_scorers
        CacheService::Store.fetch(CacheService::Keys.top_scorers(league.id, season), ttl: CacheService::Ttl::MIN_30) do
          Player.joins(:player_statistics)
                .where(player_statistics: { league: league.name, season: season.to_s })
                .order('player_statistics.goals DESC')
                .limit(20)
        end
      end
    end
  end
end
