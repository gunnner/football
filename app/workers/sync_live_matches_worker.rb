class SyncLiveMatchesWorker < BaseWorker
  sidekiq_options queue: :critical, retry: 1

  def perform
    FootballConfig.active_league_ids.each do |league_id|
      data = client.matches(date: Date.today.to_s, leagueId: league_id, limit: 100)
      next if data.blank?

      live_data = data.select { Match::LIVE_STATUSES.include?(it['state']['description']) }
      next if live_data.blank?

      log "Updating #{live_data.count} live matches for league #{league_id}..."

      live_data.each do |m|
        match = Match.find_by(external_id: m['id'])
        next unless match

        match.update!(
          status:          m['state']['description'],
          clock:           m['state']['clock'],
          score_current:   m['state']['score']['current'],
          score_penalties: m['state']['score']['penalties']
        )
      end
    end

    CacheService::Store.invalidate(CacheService::Keys.live_matches)
    CacheService::Store.invalidate(CacheService::Keys.today_matches)

    log 'Live matches sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end

  private

  def client
    @client ||= Highlightly::Client.new
  end
end
