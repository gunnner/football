class SyncLiveEventsWorker < BaseWorker
  sidekiq_options queue: :default, retry: 1

  def perform
    live = Match.live.joins(:league)
                .where(leagues: { external_id: FootballConfig.active_league_ids })

    if live.blank?
      log 'No live matches — skipping live events sync'
      return
    end

    log "Syncing events & stats for #{live.count} live matches..."

    live.each do |match|
      sync_match(match)
    end

    log 'Live events sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end

  private

  def sync_match(match)
    # Fetch rich match data once — used for events, statistics, details, predictions, shots, news
    rich_data = client.match(match.external_id)&.first
    Interactors::MatchData::SyncMatchDetails.call(match: match, match_data: rich_data) if rich_data.present?
    match.reload

    before_keys = match.match_events
                       .pluck(:time, :event_type, :player_external_id)
                       .map { |t, e, p| [ t.to_s, e, p.to_s ] }
                       .to_set

    Interactors::MatchData::SyncEvents.call(match: match)
    Interactors::MatchData::SyncStatistics.call(match: match)

    new_events = []
    match.match_events.reload.each do |event|
      key = [ event.time.to_s, event.event_type, event.player_external_id.to_s ]
      next if before_keys.include?(key)

      new_events << event
      MatchBroadcastService.broadcast_event(match, event)
    end

    CacheService::Store.invalidate(CacheService::Keys.match_events(match.id)) if new_events.any?
    MatchBroadcastService.broadcast_statistics_updated(match)

    sync_lineups_if_missing(match)
    sync_box_scores(match)
  rescue StandardError => e
    log_error "Failed to sync match #{match.id}: #{e.message}"
  end

  def sync_lineups_if_missing(match)
    return if match.match_lineups.where('jsonb_array_length(initial_lineup) > 0').exists?

    result = Interactors::MatchData::SyncLineup.call(match: match)
    if result.success? && match.match_lineups.where('jsonb_array_length(initial_lineup) > 0').exists?
      CacheService::Store.invalidate(CacheService::Keys.match_lineup(match.id))
      MatchBroadcastService.broadcast_lineups_updated(match)
    end
  end

  def sync_box_scores(match)
    result = Interactors::MatchData::SyncBoxScore.call(match: match)
    if result.success?
      CacheService::Store.invalidate(CacheService::Keys.match_box_scores(match.id))
      MatchBroadcastService.broadcast_statistics_updated(match)
    end
  end
end
