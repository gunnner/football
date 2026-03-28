module Highlightly
  module Importers
    class LeagueImporter < BaseImporter
      def call
        log 'Starting leagues import...'

        data = fetch_all_active_leagues
        return if data.blank?

        result = upsert_leagues(data)

        log "Done. Imported: #{result[:imported]}"
        result
      end

      private

      def fetch_all_active_leagues
        FootballConfig.active_league_ids.flat_map do |league_id|
          @client.leagues(leagueId: league_id) || []
        end
      end

      def upsert_leagues(data)
        country_codes = Country.pluck(:code, :id).to_h

        records = data.filter_map do |league|
          country_id = country_codes[league['country']['code']]

          unless country_id
            log_error "Country not found: #{league['country']['code']} for league #{league['name']}"
            next
          end

          seasons = league['seasons'].map { it['season'] }

          {
            external_id: league['id'],
            name:        league['name'].strip,
            logo:        league['logo'],
            country_id:  country_id,
            seasons:     seasons,
            created_at:  Time.current,
            updated_at:  Time.current
          }
        end

        League.upsert_all(
          records,
          unique_by: :external_id,
          update_only: %i[name logo seasons]
        )

        { imported: records.size }
      rescue StandardError => e
        log_error "Failed to upsert leagues: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end
    end
  end
end
