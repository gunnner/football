module Api
  module V1
    module Auth
      class RegistrationsController < Api::V1::BaseController
        skip_before_action :authenticate_api_user!

        def create
          user = User.new(registration_params)

          if user.save
            token = JwtService.encode(user_id: user.id)
            set_jwt_cookie(token)
            render json: { data: UserSerializer.new(user).serializable_hash }, status: :created
          else
            render_error user.errors.full_messages.join(', '), status: :unprocessable_content
          end
        end

        private

        def registration_params
          params.require(:user).permit(
            :email,
            :password,
            :password_confirmation,
            :first_name,
            :last_name
          )
        end

        def set_jwt_cookie(token)
          cookies[:jwt_token] = {
            value:     token,
            httponly:  true,
            secure:    Rails.env.production?,
            same_site: :lax,
            expires:   JwtService::EXPIRATION.from_now
          }
        end
      end
    end
  end
end
