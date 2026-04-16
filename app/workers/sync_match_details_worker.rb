class SyncMatchDetailsWorker < BaseWorker
  sidekiq_options queue: :default, retry: 1

  def perform
    live_matches = Match.live.joins(:league)
                        .where(leagues: { external_id: FootballConfig.active_league_ids })

    if live_matches.blank?
      log 'No live matches — skipping'
      return
    end

    log "Syncing details for #{live_matches.count} live matches..."

    live_matches.each do |match|
      result = Organizers::SyncMatchData.call(match: match)
      result.success? ? MatchBroadcastService.broadcast_statistics_updated(match)
                      : log_error("Failed: #{result.error}")
    end

    log 'Match details sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
