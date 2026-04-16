module Highlightly
  module Importers
    class PlayerStatisticsImporter < BaseImporter
      BATCH_SIZE = 50
      REDIS_OFFSET_KEY = 'player_stats_offset'

      def call
        players = active_league_players
        total   = players.count

        return { imported: 0 } if total.zero?

        offset = RedisService.get(REDIS_OFFSET_KEY).to_i
        offset = 0 if offset >= total

        batch   = players.offset(offset).limit(BATCH_SIZE)
        records, club_records = [], []

        log "Syncing player statistics: #{batch.size} players (offset #{offset}/#{total})..."

        batch.each do |player|
          stats_data = @client.player_statistics(player.external_id)
          next if stats_data.blank?

          (stats_data['perCompetition'] || []).each do |stat|
            record = build_record(player, stat)
            records << record if record
          end

          (stats_data['perClub'] || []).each do |stat|
            record = build_club_record(player, stat)
            club_records << record if record
          end
        rescue Highlightly::RateLimitError => e
          log_error "Rate limit reached after #{records.size} records: #{e.message}"
          break
        rescue StandardError => e
          log_error "Failed for player #{player.external_id}: #{e.message}"
          Sentry.capture_exception(e)
        end

        if records.any?
          # Deduplicate within batch — keep last occurrence for each unique key
          deduped = records.reverse.uniq { [ it[:player_id], it[:club], it[:season], it[:competition_type] ] }.reverse

          PlayerStatistic.upsert_all(
            deduped,
            unique_by: %i[player_id club season competition_type],
            update_only: %i[
              goals assists minutes_played games_played yellow_cards red_cards
              second_yellow_cards clean_sheets goals_conceded own_goals
              penalties_scored substituted_in substituted_out league
            ]
          )
        end

        if club_records.any?
          deduped_clubs = club_records.reverse.uniq { [ it[:player_id], it[:club] ] }.reverse

          PlayerClubStatistic.upsert_all(
            deduped_clubs,
            unique_by: %i[player_id club],
            update_only: %i[
              goals assists games_played minutes_played yellow_cards red_cards
              second_yellow_cards clean_sheets goals_conceded own_goals
              penalties_scored substituted_in substituted_out
            ]
          )
        end

        new_offset = offset + batch.size
        new_offset = 0 if new_offset >= total
        RedisService.set(REDIS_OFFSET_KEY, new_offset)

        log "Player statistics synced: #{records.size} competition records, #{club_records.size} club records, next offset: #{new_offset}"
        { imported: records.size }
      rescue StandardError => e
        log_error "PlayerStatisticsImporter failed: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end

      private

      def active_league_players
        Player.joins(box_scores: :match)
              .joins('INNER JOIN leagues ON matches.league_id = leagues.id')
              .where(leagues: { external_id: FootballConfig.active_league_ids })
              .distinct
              .order(:id)
      end

      def build_record(player, stat)
        club = stat['club']
        return if club.blank?

        {
          player_id:           player.id,
          club:                club,
          season:              stat['season']&.to_s,
          league:              stat['league'],
          competition_type:    stat['type'].to_s.parameterize(separator: '_'),
          goals:               stat['goals'].to_i,
          assists:             stat['assists'].to_i,
          minutes_played:      stat['minutesPlayed'].to_i,
          games_played:        stat['gamesPlayed'].to_i,
          yellow_cards:        stat['yellowCards'].to_i,
          red_cards:           stat['redCards'].to_i,
          second_yellow_cards: stat['secondYellowCards'].to_i,
          clean_sheets:        stat['cleanSheets'].to_i,
          goals_conceded:      stat['goalsConceded'].to_i,
          own_goals:           stat['ownGoals'].to_i,
          penalties_scored:    stat['penaltiesScored'].to_i,
          substituted_in:      stat['substitutedIn'].to_i,
          substituted_out:     stat['substitutedOut'].to_i,
          created_at:          Time.current,
          updated_at:          Time.current
        }
      end

      def build_club_record(player, stat)
        club = stat['club']
        return if club.blank?

        {
          player_id:           player.id,
          club:                club,
          goals:               stat['goals'].to_i,
          assists:             stat['assists'].to_i,
          games_played:        stat['gamesPlayed'].to_i,
          minutes_played:      stat['minutesPlayed'].to_i,
          yellow_cards:        stat['yellowCards'].to_i,
          red_cards:           stat['redCards'].to_i,
          second_yellow_cards: stat['secondYellowCards'].to_i,
          clean_sheets:        stat['cleanSheets'].to_i,
          goals_conceded:      stat['goalsConceded'].to_i,
          own_goals:           stat['ownGoals'].to_i,
          penalties_scored:    stat['penaltiesScored'].to_i,
          substituted_in:      stat['substitutedIn'].to_i,
          substituted_out:     stat['substitutedOut'].to_i,
          created_at:          Time.current,
          updated_at:          Time.current
        }
      end
    end
  end
end
