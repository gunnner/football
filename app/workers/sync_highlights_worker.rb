class SyncHighlightsWorker < BaseWorker
  sidekiq_options queue: :low, retry: 3

  def perform(date = Date.today.to_s)
    log "Syncing highlights for #{date}..."

    FootballConfig::ACTIVE_LEAGUES.each do |league|
      attr = {
        countryCode: league[:country_code],
        countryName: league[:country_name],
        leagueName:  league[:name],
        leagueId:    league[:external_id],
        date:        date,
        timezone:    'Etc/UTC',
        season:      1.year.ago.year,
        limit:       40
      }

      Highlightly::Importers::HighlightImporter.new.call(attr)
    end

    log 'Highlights sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
