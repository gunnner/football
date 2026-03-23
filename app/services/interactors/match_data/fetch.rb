module Interactors
  module MatchData
    class Fetch < Interactors::Base
      expects do
        required(:match).filled(type?: Match)
      end

      promises do
        required(:match_data).filled
      end

      def call
        fetch_data
      rescue Highlightly::Error => e
        log_error "API error: #{e.message}"
        fail!(e.message)
      end

      private

      def fetch_data
        data = client.match(context.match.external_id)
        fail!("No data for match #{context.match.external_id}") if data.blank? || data.first.blank?

        context.match_data = data.first
      end

      def client
        @client ||= Highlightly::Client.new
      end
    end
  end
end
