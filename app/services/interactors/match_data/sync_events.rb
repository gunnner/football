module Interactors
  module MatchData
    class SyncEvents < Interactors::Base
      expects do
        required(:match).filled(type?: Match)
      end

      def call
        event_records = map_events_data
        return if event_records.blank?

        upsert_events(event_records)
      rescue StandardError => e
        log_error "Failed to sync events for match #{context.match.id}: #{e.message}"
        fail!(e.message)
      end

      private

      def map_events_data
        data = client.events(context.match.external_id)
        return if data.blank?

        data.map do |event|
          next if event.blank?

          {
            match_id:                     context.match.id,
            time:                         event['time'],
            event_type:                   event['type'],
            team_external_id:             event['team']['id'],
            team_name:                    event['team']['name'],
            team_logo:                    event['team']['logo'],
            player_external_id:           event['playerId'],
            player_name:                  event['player'],
            assisting_player_external_id: event['assistingPlayerId'],
            assisting_player_name:        event['assist'],
            substituted_player:           event['substituted'],
            created_at:                   Time.current,
            updated_at:                   Time.current
          }
        end
      end

      def client
        @client ||= Highlightly::Client.new
      end

      def upsert_events(event_records)
        MatchEvent.upsert_all(
          event_records,
          unique_by: %i[match_id time event_type player_external_id],
        )
      end
    end
  end
end
