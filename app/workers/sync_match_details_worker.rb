class SyncMatchDetailsWorker < BaseWorker
  sidekiq_options queue: :default, retry: 1

  def perform
    base_scope = Match.joins(:league).where(leagues: { external_id: FootballConfig.active_league_ids })

    live_matches = base_scope.live

    # Also sync upcoming matches in the next 24h that are missing venue/referee details
    upcoming_without_details = base_scope
      .where(status: Match::NOT_STARTED)
      .where(date: Time.current..24.hours.from_now)
      .where(venue_name: nil)

    matches = (live_matches + upcoming_without_details).uniq(&:id)

    if matches.blank?
      log 'No matches to sync — skipping'
      return
    end

    log "Syncing details for #{matches.count} match(es) (#{live_matches.count} live, #{upcoming_without_details.count} upcoming)..."

    matches.each do |match|
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
