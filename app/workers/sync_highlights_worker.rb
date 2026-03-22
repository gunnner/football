class SyncHighlightsWorker < BaseWorker
  sidekiq_options queue: :low, retry: 3

  def perform(date = Date.today.to_s)
    log "Syncing highlights for #{date}..."

    Highlightly::Importers::HighlightImporter.new.(
      date: Date.parse(date)
    )

    log 'Highlights sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
