class SyncStaticDataWorker < BaseWorker
  sidekiq_options queue: :low, retry: 3

  def perform
    log 'Starting static data sync...'

    Highlightly::Importers::CountryImporter.new.call
    Highlightly::Importers::LeagueImporter.new.call
    Highlightly::Importers::TeamDetailImporter.new.call

    log 'Static data sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
