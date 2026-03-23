module Interactors
  module MatchData
    class SyncStatistics < Interactors::Base
      expects do
        required(:match).filled(type?: Match)
      end

      def call
        stats_records = map_stats_data
        return if stats_records.blank?

        upsert_stats(stats_records)
      rescue StandardError => e
        log_error "Failed to sync statistics for match #{context.match.id}: #{e.message}"
        fail!(e.message)
      end

      private

      def map_stats_data
        data = client.statistics(context.match.external_id)
        return if data.blank?

        data.flat_map do |team_stats|
          team_stats['statistics'].map do |stat|
            {
              match_id:         context.match.id,
              team_external_id: team_stats['team']['id'],
              team_name:        team_stats['team']['name'],
              team_logo:        team_stats['team']['logo'],
              display_name:     stat['displayName'],
              value:            stat['value'],
              created_at:       Time.current,
              updated_at:       Time.current
            }
          end
        end
      end

      def client
        @client ||= Highlightly::Client.new
      end

      def upsert_stats(stats_records)
        MatchStatistic.upsert_all(
          stats_records,
          unique_by:   %i[match_id team_external_id display_name],
          update_only: %i[value]
        )
      end
    end
  end
end
