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

        data.filter_map do |event|
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

      def upsert_events(event_records)
        # Deduplicate by [match_id, time, event_type, player_external_id] — keep last occurrence
        deduped = event_records.uniq { [ it[:match_id], it[:time], it[:event_type], it[:player_external_id] ] }

        MatchEvent.upsert_all(
          deduped,
          unique_by: %i[match_id time event_type player_external_id],
        )

        # Hard sync: remove any DB events not present in the current API response.
        # This cleans up ghost rows that appeared when the API changed event times or
        # player IDs between fetches (e.g. 19' → 18' after player_id was resolved).
        api_fingerprints = deduped.map { [ it[:time], it[:event_type], it[:player_external_id] ] }.to_set

        MatchEvent.where(match_id: context.match.id).find_each do |evt|
          fingerprint = [ evt.time, evt.event_type, evt.player_external_id ]
          evt.destroy unless api_fingerprints.include?(fingerprint)
        end
      end
    end
  end
end
