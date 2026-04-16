class SyncLiveMatchesWorker < BaseWorker
  sidekiq_options queue: :critical, retry: 1

  DONE_STATUSES = [ 'Finished', 'Finished after penalties', 'Finished after extra time', 'Cancelled', 'Postponed' ].freeze

  def perform
    # Include matches from the last 36 hours that aren't definitively done,
    # so yesterday's matches that crossed midnight get their final status synced.
    recent = Match.joins(:league)
                  .where(leagues: { external_id: FootballConfig.active_league_ids })
                  .where(date: 36.hours.ago..Time.current)
                  .where.not(status: DONE_STATUSES)

    if recent.blank?
      log 'No recent unfinished matches — skipping live sync'
      return
    end

    active = recent.where(status: Match::LIVE_STATUSES)
                   .or(recent.where(status: Match::NOT_STARTED)
                              .where(date: ..30.minutes.from_now))

    unless active.exists?
      log 'No live or imminent matches — skipping live sync'
      return
    end

    newly_finished = []

    # Group active matches by their actual date so we query the API with the correct date
    active.group_by { it.date.to_date }.each do |match_date, matches_on_date|
      FootballConfig.active_league_ids.each do |league_id|
        data = client.matches(date: match_date.to_s, leagueId: league_id, limit: 100)
        next if data.blank?

        relevant_external_ids = matches_on_date.select { it.league.external_id == league_id }
                                               .map(&:external_id)
                                               .to_set

        relevant_data = data.select { relevant_external_ids.include?(it['id']) }
        next if relevant_data.blank?

        log "Updating #{relevant_data.count} matches for league #{league_id} on #{match_date}..."

        relevant_data.each do |m|
          match = Match.find_by(external_id: m['id'])
          next unless match

          was_finished = DONE_STATUSES.include?(match.status)
          new_status = m['state']['description']

          match.update!(
            status:          new_status,
            clock:           m['state']['clock'],
            score_current:   m['state']['score']['current'],
            score_penalties: m['state']['score']['penalties']
          )

          newly_finished << match if !was_finished && DONE_STATUSES.include?(new_status)
        end
      end
    end

    if newly_finished.any?
      log "#{newly_finished.count} match(es) just finished — queuing final sync"
      SyncAllStandingsWorker.perform_async
      newly_finished.map { |m| m.date.to_date }.uniq.each do |match_date|
        SyncHighlightsWorker.perform_async(match_date.to_s)
      end
      newly_finished.each { |m| SyncMatchFinalStatsWorker.perform_async(m.id) }
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
end
