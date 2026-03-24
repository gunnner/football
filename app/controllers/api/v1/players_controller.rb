module Api
  module V1
    class PlayersController < BaseController
      def index
        players = fetch_players
        render_success(PlayerSerializer.new(players).serializable_hash, meta: pagination_meta)
      end

      def show
        render_success PlayerSerializer.new(player).serializable_hash
      end

      def statistics
        stats = CacheService::Store.fetch(CacheService::Keys.player_statistics(player.id), ttl: CacheService::Ttl::HOUR_24) do
          player.player_statistics.as_json
        end

        render json: { data: stats }
      end

      def transfers
        transfers = CacheService::Store.fetch(CacheService::Keys.player_transfers(player.id), ttl: CacheService::Ttl::HOUR_24) do
          player.player_transfers.as_json
        end

        render json: { data: transfers }
      end

      private

      def fetch_players
        return paginate(Player.search_by_name(params[:name])) if params[:name].present?

        paginate(Player.order(:name))
      end

      def player
        @player ||= Player.includes(:player_profile).find(params[:id])
      end
    end
  end
end
