class SyncAllStandingsWorker < BaseWorker
  sidekiq_options queue: :low, retry: 3

  def perform
    log 'Starting standings sync...'

    current_year = Date.today.year - 1

    FootballConfig.active_league_ids.each do |external_id|
      remaining = RedisService.get('requested_attempts').to_i

      if remaining >= Highlightly::Client::RATE_LIMIT_THRESHOLD
        log_error 'Rate limit threshold reached — stopping'
        break
      end

      SyncStandingsWorker.perform_async(external_id, current_year)
    end

    log 'Done'
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
