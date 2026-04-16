module Highlightly
  module Importers
    class TeamStatisticsImporter < BaseImporter
      # API: GET /teams/statistics/{id}?fromDate=YYYY-MM-DD
      # Returns array of objects, one per league/season. No server-side filtering by league/season.
      def call(league_external_id:, season:)
        teams = Team.in_active_leagues
        records = []

        from_date = "#{season}-08-01"

        log "Syncing team statistics for #{teams.count} teams (league #{league_external_id}, from #{from_date})..."

        teams.each do |team|
          response = @client.team_statistics(team.external_id, fromDate: from_date)
          next if response.blank?

          # Response is an array — find the entry matching our league and season
          entry = Array.wrap(response).detect do |s|
            s['leagueId'].to_s == league_external_id.to_s && s['season'].to_i == season
          end
          next if entry.blank?

          record = build_record(team, entry, league_external_id, season)
          records << record if record
        rescue Highlightly::RateLimitError => e
          log_error "Rate limit reached after #{records.size} teams: #{e.message}"
          break
        rescue StandardError => e
          log_error "Failed for team #{team.external_id}: #{e.message}"
          Sentry.capture_exception(e)
        end

        return { imported: 0 } if records.blank?

        TeamStatistic.upsert_all(
          records,
          unique_by: %i[team_id season league_external_id],
          update_only: %i[
            home_played home_wins home_draws home_loses home_scored home_received
            away_played away_wins away_draws away_loses away_scored away_received
            total_played total_wins total_draws total_loses total_scored total_received
            league_name
          ]
        )

        log "Team statistics synced: #{records.size}"
        { imported: records.size }
      rescue StandardError => e
        log_error "TeamStatisticsImporter failed: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end

      private

      def build_record(team, entry, league_external_id, season)
        home  = entry['home']  || {}
        away  = entry['away']  || {}
        total = entry['total'] || {}

        {
          team_id:            team.id,
          season:             season,
          league_external_id: league_external_id,
          league_name:        entry['leagueName'],
          home_played:        home.dig('games', 'played') || 0,
          home_wins:          home.dig('games', 'wins')   || 0,
          home_draws:         home.dig('games', 'draws')  || 0,
          home_loses:         home.dig('games', 'loses')  || 0,
          home_scored:        home.dig('goals', 'scored')   || 0,
          home_received:      home.dig('goals', 'received') || 0,
          away_played:        away.dig('games', 'played') || 0,
          away_wins:          away.dig('games', 'wins')   || 0,
          away_draws:         away.dig('games', 'draws')  || 0,
          away_loses:         away.dig('games', 'loses')  || 0,
          away_scored:        away.dig('goals', 'scored')   || 0,
          away_received:      away.dig('goals', 'received') || 0,
          total_played:       total.dig('games', 'played') || 0,
          total_wins:         total.dig('games', 'wins')   || 0,
          total_draws:        total.dig('games', 'draws')  || 0,
          total_loses:        total.dig('games', 'loses')  || 0,
          total_scored:       total.dig('goals', 'scored')   || 0,
          total_received:     total.dig('goals', 'received') || 0,
          created_at:         Time.current,
          updated_at:         Time.current
        }
      end
    end
  end
end
