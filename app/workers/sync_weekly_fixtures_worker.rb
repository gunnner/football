class SyncWeeklyFixturesWorker < BaseWorker
  sidekiq_options queue: :low, retry: 2

  def perform
    log 'Starting weekly fixtures import (next 7 days)...'

    (0..6).each do |days_ahead|
      date = Date.today + days_ahead

      FootballConfig.active_league_ids.each do |league_id|
        Highlightly::Importers::MatchImporter.new.call(date: date, league_id: league_id)
      end
    end

    log 'Weekly fixtures import completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
