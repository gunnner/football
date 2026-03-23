module Highlightly
  module Importers
    class CountryImporter < BaseImporter
      def call
        log 'Starting countries import...'

        data = @client.countries
        # debugger
        return if data.blank?

        results = upsert_countries(data)

        log "Done. Imported: #{results[:imported]}, Skipped: #{results[:skipped]}"
        results
      end

      private

      def upsert_countries(data)
        imported = 0
        skipped  = 0

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
