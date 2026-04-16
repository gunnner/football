module Highlightly
  module Importers
    class CountryImporter < BaseImporter
      def call
        log 'Starting countries import...'

        active_countries_codes = FootballConfig::ACTIVE_LEAGUES.map { _1[:country_code] }
        total_imported = 0

        active_countries_codes.each do |country_code|
          data = @client.countries(country_code)
          next if data.blank?

          results = upsert_countries(data)
          total_imported += results[:imported].to_i
          log "Imported #{results[:imported]} for #{country_code}"
        end

        log "Done. Total imported: #{total_imported}"
        { imported: total_imported }
      end

      private

      def upsert_countries(data)
        imported, skipped = 0, 0

        records = data.map do |country|
          {
            code:       country['code'].upcase.strip,
            name:       country['name'].strip,
            logo:       country['logo'],
            created_at: Time.current,
            updated_at: Time.current
          }
        end

        Country.upsert_all(
          records,
          unique_by: :code,
          update_only: %i[name logo]
        )

        imported = records.size
        { imported: imported, skipped: skipped }
      rescue StandardError => e
        log_error "Failed to upsert countries: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, skipped: 0, error: e.message }
      end
    end
  end
end
