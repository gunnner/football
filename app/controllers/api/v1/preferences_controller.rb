module Api
  module V1
    class PreferencesController < BaseController
      def show
        render_success serialized_preferences
      end

      def update
        if preference.update(preference_params)
          render_success serialized_preferences
        else
          render_error preference.errors.full_messages.join(', ')
        end
      end

      private

      def preference
        @preference ||= current_api_user.preference
      end

      def serialized_preferences
        @serialized_preferences ||= PreferenceSerializer.new(preference).serializable_hash
      end

      def preference_params
        params.require(:preference).permit(
          :timezone,
          :default_league_id,
          notification_settings: %i[match_start goals match_end standings]
        )
      end
    end
  end
end
