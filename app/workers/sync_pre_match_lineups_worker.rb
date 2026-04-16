class SyncPreMatchLineupsWorker < BaseWorker
  sidekiq_options queue: :default, retry: 1

  # Runs every 15 minutes via sidekiq-cron.
  # Fetches lineups from the Highlightly API for upcoming matches that:
  #   - are in active leagues
  #   - start within the next 90 minutes (lineups typically released ~1h before kickoff)
  #   - have no lineups stored yet
  #
  # Once lineups are found, the cache is invalidated and clients are notified
  # via ActionCable so the Lineups tab refreshes automatically.

  def perform
    window_end = 90.minutes.from_now

    # Exclude matches that already have at least one lineup with actual players.
    # Lineups with empty initial_lineup (e.g. API returned "Unknown" formation)
    # are not considered confirmed — keep retrying for those.
    matches_with_real_lineups = MatchLineup.where("jsonb_array_length(initial_lineup) > 0")
                                           .select(:match_id)

    candidates = Match
      .joins(:league)
      .where(leagues: { external_id: FootballConfig.active_league_ids })
      .where(status: 'Not started')
      .where(date: Time.current..window_end)
      .where.not(id: matches_with_real_lineups)
      .includes(:home_team, :away_team, :league)

    if candidates.blank?
      log 'No upcoming matches without lineups — skipping'
      return
    end

    log "Checking lineups for #{candidates.count} upcoming match(es)"

    candidates.each do |match|
      result = Interactors::MatchData::SyncLineup.call(match: match)

      if result.success? && match.match_lineups.where('jsonb_array_length(initial_lineup) > 0').exists?
        log "Lineups found for match #{match.id} (#{match.home_team.name} vs #{match.away_team.name})"
        CacheService::Store.invalidate(CacheService::Keys.match_lineup(match.id))
        CacheService::Store.invalidate(CacheService::Keys.match(match.id))
        MatchBroadcastService.broadcast_lineups_updated(match)
      else
        log "No lineups yet for match #{match.id} — will retry on next run"
      end
    rescue Highlightly::RateLimitError => e
      log_error "Rate limit during lineup sync for match #{match.id}: #{e.message}"
      Sentry.capture_exception(e)
      break  # stop processing further matches to preserve budget
    rescue StandardError => e
      log_error "Failed to sync lineup for match #{match.id}: #{e.message}"
      Sentry.capture_exception(e)
    end

    log 'Pre-match lineup sync completed'
  rescue Highlightly::RateLimitError => e
    log_error "Rate limit reached: #{e.message}"
    Sentry.capture_exception(e)
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
