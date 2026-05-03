class SyncMatchesWorker < BaseWorker
  sidekiq_options queue: :default, retry: 3

  DONE_STATUSES = SyncLiveMatchesWorker::DONE_STATUSES

  def perform(date = Date.today.to_s)
    # Also sync yesterday to catch matches that crossed midnight without a final status update
    dates = [ Date.yesterday.to_s, date ].uniq

    log "Starting matches sync for #{dates.join(', ')}..."

    # Snapshot which matches are not yet done — used to detect newly finished after upsert
    date_range = Date.parse(dates.min).beginning_of_day..Date.parse(dates.max).end_of_day
    unfinished_ids = Match.joins(:league)
                          .where(leagues: { external_id: FootballConfig.active_league_ids })
                          .where(date: date_range)
                          .where.not(status: DONE_STATUSES)
                          .pluck(:id)
                          .to_set

    dates.each do |d|
      FootballConfig.active_league_ids.each do |league_id|
        Highlightly::Importers::MatchImporter.new.call(date: d, league_id: league_id)
      end
    end

    if unfinished_ids.any?
      newly_finished = Match.where(id: unfinished_ids.to_a, status: DONE_STATUSES)
      if newly_finished.any?
        log "#{newly_finished.count} match(es) newly finished — queuing final stats sync"
        newly_finished.each { SyncMatchFinalStatsWorker.perform_async(_1.id) }
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
