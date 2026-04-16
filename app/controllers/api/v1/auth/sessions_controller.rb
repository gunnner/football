module Api
  module V1
    module Auth
      class SessionsController < Api::V1::BaseController
        skip_before_action :authenticate_api_user!, only: %i[create destroy]

        def create
          user = User.find_by(email: sign_in_params[:email])

          if user&.valid_password?(sign_in_params[:password])
            token = JwtService.encode(user_id: user.id)
            set_jwt_cookie(token)
            render json: { data: UserSerializer.new(user).serializable_hash }
          else
            render_error 'Invalid email or password', status: :unauthorized
          end
        end

        def destroy
          token = extract_token
          TokenBlacklistService.add(token) if token
          clear_jwt_cookie
          render json: { message: 'Signed out successfully' }
        end

        def me
          render json: UserSerializer.new(current_api_user).serializable_hash
        end

        private

        def sign_in_params
          params.require(:user).permit(:email, :password)
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

        def clear_jwt_cookie
          cookies.delete(:jwt_token, same_site: :lax)
        end
      end
    end
  end
end
