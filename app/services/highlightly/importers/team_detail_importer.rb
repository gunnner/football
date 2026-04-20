module Highlightly
  module Importers
    class TeamDetailImporter < BaseImporter
      def call
        teams = Team.in_active_leagues

        log "Syncing details for #{teams.count} teams..."

        updated = 0

        teams.each do |team|
          raw  = @client.team(team.external_id)
          data = raw.is_a?(Array) ? raw.first : raw
          next if data.blank?

          team.update_columns(build_attrs(data))
          updated += 1
        rescue Highlightly::RateLimitError => e
          log_error "Rate limit reached after #{updated} teams: #{e.message}"
          break
        rescue StandardError => e
          log_error "Failed for team #{team.external_id}: #{e.message}"
          Sentry.capture_exception(e)
        end

        log "Team details synced: #{updated}"
        { updated: updated }
      end

      private

      def build_attrs(data)
        venue = data['venue'] || {}
        coach = data['coach'] || {}

        {
          country:        data.dig('country', 'name'),
          founded:        data['founded'].to_i.nonzero?,
          venue_name:     venue['name'],
          venue_city:     venue['city'],
          venue_capacity: venue['capacity'].to_i.nonzero?,
          coach_name:     coach['name'],
          updated_at:     Time.current
        }.compact
      end
    end
  end
end
