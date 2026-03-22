class SyncStandingsWorker < BaseWorker
  sidekiq_options queue: :low, retry: 3

  def perform(league_external_id, season)
    log "Syncing standings for league #{league_external_id}, season #{season}..."

    Highlightly::Importers::StandingImporter.new.(
      league_external_id: league_external_id,
      season:             season
    )

    log 'Standings sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
