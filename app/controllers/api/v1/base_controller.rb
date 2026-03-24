module Api
  module V1
    class BaseController < ApplicationController
      protect_from_forgery with: :null_session

      before_action :set_default_format

      rescue_from ActiveRecord::RecordNotFound,       with: :not_found
      rescue_from ActionController::ParameterMissing, with: :bad_request

      private

      def set_default_format
        request.format = :json
      end

      def render_success(data, status: :ok, meta: nil)
        response = data
        response[:meta] = meta if meta.present?
        render json: response, status: status
      end

      def render_error(message, status: :unprocessable_entity)
        render json: { error: message }, status: status
      end

      def not_found
        render_error 'Resource not found', status: :not_found
      end

      def bad_request(e)
        render_error e.message, status: :bad_request
      end

      def paginate(scope)
        @pagy, records = pagy(scope, limit: per_page)
        records
      end

      def pagination_meta
        return {} unless @pagy

        {
          total:      @pagy.count,
          page:       @pagy.page,
          per_page:   @pagy.limit,
          total_page: @pagy.pages
        }
      end

      def per_page
        [ params.fetch(:per_page, 20).to_i, 100 ].min
      end
    end
  end
end
