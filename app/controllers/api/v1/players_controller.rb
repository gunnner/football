module Api
  module V1
    class PlayersController < BaseController
      skip_before_action :authenticate_api_user!, only: %i[show statistics transfers]

      def index
        players = fetch_players
        render_success(PlayerSerializer.new(players).serializable_hash, meta: pagination_meta)
      end

      def show
        result = CacheService::Store.fetch(CacheService::Keys.player_profile(params[:id]), ttl: CacheService::Ttl::HOUR_24) do
          {
            data: PlayerSerializer.new(player, include: %i[player_profile]).serializable_hash,
            meta: {
              current_team:   current_team_data,
              flags:          player.national_flags,
              shirt_number:   player.box_scores.joins(:match).order('matches.date DESC').pick(:shirt_number),
              market_value:   market_value_data,
              average_rating: player.average_rating_for_season
            }
          }
        end

        render json: result
      end

      def statistics
        stats = CacheService::Store.fetch(CacheService::Keys.player_statistics(player.id), ttl: CacheService::Ttl::HOUR_24) do
          player.player_statistics.order(season: :desc).as_json
        end

        render json: { data: stats }
      end

      def transfers
        query = PlayerQueries::TransfersQuery.new(player)
        data = CacheService::Store.fetch(CacheService::Keys.player_transfers(player.id), ttl: CacheService::Ttl::HOUR_24) do
          query.call
        end

        render json: { data: data }
      end

      private

      def fetch_players
        return paginate(Player.search_by_name(params[:name])) if params[:name].present?

        paginate(Player.order(:name))
      end

      def player
        @player ||= Player.includes(:player_profile, :player_market_values).find(params[:id])
      end

      def current_team_data
        team = player.current_team
        return if team.blank?

        {
          id:   team.id,
          name: team.name,
          logo: team.logo,
          path: "/teams/#{team.id}"
        }
      end

      def market_value_data
        market_value = player.player_market_values.order(recorded_date: :desc).first
        return if market_value.blank?

        {
          value:         market_value.value,
          currency:      market_value.currency || '€',
          recorded_date: market_value.recorded_date.to_s
        }
      end
    end
  end
end
