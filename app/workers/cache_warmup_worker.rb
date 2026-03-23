class CacheWarmupWorker < BaseWorker
  sidekiq_options queue: :low, retry: 1

  def perform
    log 'Starting cache warmup...'

    warm_leagues
    warm_today_matches

    log 'Cache warmup completed'
  rescue StandardError => e
    log_error "Cache warmup failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end

  private

  def warm_leagues
    Interactors::CacheWarmup::Leagues.call
  end

  def warm_today_matches
    Interactors::CacheWarmup::TodayMatches.call
  end
end
