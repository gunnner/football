class SyncMatchesWorker < BaseWorker
  sidekiq_options queue: :default, retry: 3

  def perform(date = Date.today.to_s)
    log "Starting matches sync for #{date}..."

    FootballConfig.active_league_ids.each do |league_id|
      Highlightly::Importers::MatchImporter.new.(date: Date.parse(date), league_id: league_id)
    end

    log 'Matches sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
