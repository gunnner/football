class SyncPlayerProfilesWorker < BaseWorker
  sidekiq_options queue: :low, retry: 3

  def perform
    log 'Starting player profiles sync...'

    Highlightly::Importers::PlayerProfileImporter.new.call

    log 'Player profiles sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
