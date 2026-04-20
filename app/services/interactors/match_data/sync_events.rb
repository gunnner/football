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
        strict_deduped = event_records.uniq { [ it[:match_id], it[:time], it[:event_type], it[:player_external_id] ] }

        # Fuzzy deduplicate: if two events share the same event_type + player_external_id
        # and their times are within 1 minute of each other, keep only the first one.
        # This handles APIs that return the same goal at "29'" and "30'" in different syncs.
        deduped = []
        strict_deduped.each do |evt|
          evt_min = parse_minute(evt[:time])
          already_seen = deduped.any? do |seen|
            seen[:event_type]         == evt[:event_type] &&
            seen[:player_external_id] == evt[:player_external_id] &&
            seen[:player_external_id].present? &&
            (parse_minute(seen[:time]) - evt_min).abs <= 1
          end
          deduped << evt unless already_seen
        end

        MatchEvent.upsert_all(
          deduped,
          unique_by: %i[match_id time event_type player_external_id],
        )

        # Hard sync: remove any DB events not present in the current API response.
        # Uses fuzzy matching (±1 min) to avoid deleting events that the API returned
        # with a slightly different time string between syncs.
        MatchEvent.where(match_id: context.match.id).find_each do |evt|
          evt_min = parse_minute(evt.time)
          matched = deduped.any? do |api|
            api[:event_type]         == evt.event_type &&
            api[:player_external_id] == evt.player_external_id &&
            evt.player_external_id.present? &&
            (parse_minute(api[:time]) - evt_min).abs <= 1
          end
          evt.destroy unless matched
        end
      end

      # Converts event time strings like "29'", "45'+2", "90'+3" to plain minutes (integer).
      def parse_minute(time)
        return 0 if time.blank?
        base, extra = time.to_s.delete("'").split('+').map(&:to_i)
        (base || 0) + (extra || 0)
      end
    end
  end
end
