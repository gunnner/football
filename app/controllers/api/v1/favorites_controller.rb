module Api
  module V1
    class FavoritesController < BaseController
      def index
        render json: {
          data: {
            leagues: serialized_leagues,
            teams:   serialized_teams,
            players: serialized_players
          }
        }
      end

      def leagues
        render_success serialized_leagues
      end

      def teams
        render_success serialized_teams
      end

      def players
        render_success serialized_players
      end

      def create
        favoritable = find_favoritable
        favorite    = current_api_user.favorites.find_or_initialize_by(favoritable: favoritable)

        if favorite.new_record? && favorite.save
          render json: { message: 'Added to favorites' }, status: :created
        else
          render_error 'Already in favorites', status: :unprocessable_content
        end
      end

      def destroy
        favorite = current_api_user.favorites.find(params[:id])
        favorite.destroy
        render json: { message: 'Removed from favorites' }
      rescue ActiveRecord::RecordNotFound
        render_error 'Favorite not found', status: :not_found
      end

      private

      def serialized_leagues
        @serialized_leagues ||= LeagueSerializer.new(current_api_user.favorite_leagues).serializable_hash
      end

      def serialized_teams
        @serialized_teams ||= TeamSerializer.new(current_api_user.favorite_teams).serializable_hash
      end

      def serialized_players
        @serialized_players ||= PlayerSerializer.new(current_api_user.favorite_players).serializable_hash
      end

      def find_favoritable
        type = favorite_params[:favoritable_type]
        id   = favorite_params[:favoritable_id]

        raise ActionController::ParameterMissing, :favoritable_type unless type.in?(Favorite::FAVORITABLE_TYPES)

        type.constantize.find(id)
      end

      def favorite_params
        params.require(:favorite).permit(:favoritable_type, :favoritable_id)
      end
    end
  end
end
