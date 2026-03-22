module Interactors
  module MatchData
    class UpdateState < Interactors::Base
      expects do
        required(:match).filled(type?: Match)
        required(:match_data).filled
      end

      def call
        update_match_data
      rescue StandardError => e
        log_error "Failed to update match #{context.match.id}: #{e.message}"
        fail!(e.message)
      end

      private

      def update_match_data
        context.match.update!(
          status:          context.match_data['state']['description'],
          clock:           context.match_data['state']['clock'],
          score_current:   context.match_data['state']['score']['current'],
          score_penalties: context.match_data['state']['score']['penalties']
        )
      end
    end
  end
end
