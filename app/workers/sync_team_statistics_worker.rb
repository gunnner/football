class SyncTeamStatisticsWorker < BaseWorker
  sidekiq_options queue: :low, retry: 3

  def perform
    log 'Starting team statistics sync...'

    season = Date.today.year - 1

    FootballConfig.active_league_ids.each do |league_id|
      requested_attempts = RedisService.get('requested_attempts').to_i
      if requested_attempts >= Highlightly::Client::RATE_LIMIT_THRESHOLD
        log_error 'Rate limit threshold reached — stopping'
        break
      end

      Highlightly::Importers::TeamStatisticsImporter.new.call(
        league_external_id: league_id,
        season:             season
      )
    end

    log 'Team statistics sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
