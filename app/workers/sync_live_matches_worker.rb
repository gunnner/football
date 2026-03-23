class SyncLiveMatchesWorker < BaseWorker
  sidekiq_options queue: :critical, retry: 1

  def perform
    live_matches = Match.live

    if live_matches.blank?
      log 'No live matches — skipping'
      return
    end

    log "Syncing #{live_matches.count} live matches..."

    live_matches.each { sync_match(it) }

    log 'Live matches sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end

  private

  def sync_match(match)
    result = Organizers::SyncMatchData.(match: match)
    log_error "Failed to sync match #{match.id}: #{result.error}" if result.failure?
  end
end
