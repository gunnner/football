class SyncMatchFinalStatsWorker < BaseWorker
  sidekiq_options queue: :default, retry: 2

  def perform(match_id)
    match     = Match.find(match_id)
    rich_data = client.match(match.external_id)&.first

    Interactors::MatchData::SyncMatchDetails.call(match: match, match_data: rich_data) if rich_data.present?
    Interactors::MatchData::SyncEvents.call(match: match)
    Interactors::MatchData::SyncLineup.call(match: match)
    Interactors::MatchData::SyncStatistics.call(match: match)
    Interactors::MatchData::SyncBoxScore.call(match: match)

    MatchBroadcastService.broadcast_statistics_updated(match)

    CacheService::Store.invalidate(CacheService::Keys.match_statistics(match_id))
    CacheService::Store.invalidate(CacheService::Keys.match_box_scores(match_id))

    log "Final stats synced for match #{match_id}"
  rescue ActiveRecord::RecordNotFound
    log_error "Match #{match_id} not found"
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
