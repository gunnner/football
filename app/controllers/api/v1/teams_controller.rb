module Api
  module V1
    class TeamsController < BaseController
      def index
        teams = fetch_teams
        render_success(TeamSerializer.new(teams).serializable_hash, meta: pagination_meta)
      end

      def show
        render_success TeamSerializer.new(team).serializable_hash
      end

      def statistics
        stats = CacheService::Store.fetch(CacheService::Keys.team_statistics(team.id, season), ttl: CacheService::Ttl::HOUR_1) do
          team.team_statistics.for_season(season).as_json
        end

        render json: { data: stats }
      end

      def matches
        scope = team.matches.includes(:home_team, :away_team, :league)
        scope = scope.public_send(params[:status]) if valid_status_scope?
        matches = paginate(scope.order(date: :desc))

        render_success(MatchSerializer.new(matches).serializable_hash, meta: pagination_meta)
      end

      def players
        player  = Player.joins(:player_statistics)
                        .where(player_statistics: { club: team.name })
                        .distinct

        render_success PlayerSerializer.new(player).serializable_hash
      end

      def transfers
        transfers = PlayerTransfer.where('team_from = ? OR team_to = ?', team.name, team.name)
                                  .order(transfer_date: :desc)

        render json: { data: transfers }
      end

      private

      def team
        @team ||= Team.find(params[:id])
      end

      def season
        @season ||= params.fetch(:season, Date.today.year).to_i
      end

      def fetch_teams
        return paginate(Team.where('name ILIKE ?', "%#{params[:name]}%")) if params[:name].present?

        paginate(Team.order(:name))
      end

      def valid_status_scope?
        params[:status].present? && params[:status].in?(%w[live finished upcoming today])
      end
    end
  end
end
