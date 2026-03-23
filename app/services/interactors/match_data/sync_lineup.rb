module Interactors
  module MatchData
    class SyncLineup < Interactors::Base
      expects do
        required(:match).filled(type?: Match)
      end

      def call
        lineup_data = fetch_lineups
        return if lineup_data.blank?

        upsert_lineup(lineup_data['homeTeam'])
        upsert_lineup(lineup_data['awayTeam'])
      rescue StandardError => e
        log_error "Failed to sync lineup for match #{context.match.id}: #{e.message}"
        fail!(e.message)
      end

      private

      def fetch_lineups
        client.lineups(context.match.external_id)
      end

      def upsert_lineup(team_data)
        return if team_data.blank?

        MatchLineup.upsert_all(
          [ {
            match_id:         context.match.id,
            team_external_id: team_data['id'],
            team_name:        team_data['name'],
            team_logo:        team_data['logo'],
            formation:        team_data['formation'],
            initial_lineup:   team_data['initialLineup'],
            substitutes:      team_data['substitutes'],
            created_at:       Time.current,
            updated_at:       Time.current
          } ],
          unique_by:   %i[match_id team_external_id],
          update_only: %i[formation initial_lineup substitutes]
        )
      end

      def client
        @client ||= Highlightly::Client.new
      end
    end
  end
end
