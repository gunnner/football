class SyncMatchesWorker < BaseWorker
  sidekiq_options queue: :default, retry: 3

  def perform(date = Date.today.to_s)
    # Also sync yesterday to catch matches that crossed midnight without a final status update
    dates = [ Date.yesterday.to_s, date ].uniq

    log "Starting matches sync for #{dates.join(', ')}..."

    dates.each do |d|
      FootballConfig.active_league_ids.each do |league_id|
        Highlightly::Importers::MatchImporter.new.call(date: d, league_id: league_id)
      end
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
