class SyncH2hWorker < BaseWorker
  sidekiq_options queue: :default, retry: 1

  # For each unique home/away team pair in upcoming active-league matches,
  # fetches the last 10 H2H results from the API and upserts them into the
  # matches table so the /api/v1/matches/h2h endpoint can serve purely from DB.
  def perform
    upcoming = Match.joins(:league)
                    .where(leagues: { external_id: FootballConfig.active_league_ids })
                    .where(status: 'Not started')
                    .where(date: Time.current..7.days.from_now)
                    .pluck(:home_team_id, :away_team_id)

    if upcoming.blank?
      log 'No upcoming matches — skipping H2H sync'
      return
    end

    # Deduplicate pairs (order-independent)
    pairs = upcoming.map { |home_id, away_id| [ home_id, away_id ].sort }.uniq

    log "Syncing H2H for #{pairs.size} team pair(s)"

    pairs.each do |team_a_id, team_b_id|
      team_a = Team.find_by(id: team_a_id)
      team_b = Team.find_by(id: team_b_id)
      next unless team_a && team_b

      raw = client.head_to_head(team_a.external_id, team_b.external_id)
      next if raw.blank?

      result =  Highlightly::Importers::MatchImporter.new.import_raw(Array(raw))
      log "H2H #{team_a.name} vs #{team_b.name}: imported #{result[:imported]} match(es)"
    rescue Highlightly::RateLimitError => e
      log_error "Rate limit reached: #{e.message}"
      Sentry.capture_exception(e)
      break
    rescue StandardError => e
      log_error "Failed H2H sync for pair #{team_a_id}/#{team_b_id}: #{e.message}"
      Sentry.capture_exception(e)
    end

    log 'H2H sync completed'
  rescue StandardError => e
    log_error "Failed: #{e.message}"
    Sentry.capture_exception(e)
    raise
  end
end
