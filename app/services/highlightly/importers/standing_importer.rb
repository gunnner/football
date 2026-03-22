module Highlightly
  module Importers
    class StandingImporter < BaseImporter
      def call(league_external_id:, season:)
        log "Starting standings import for league #{league_external_id}, season #{season}..."

        data = @client.standings(leagueId: league_external_id, season: season)
        return if data.blank?

        result = upsert_standings(data, league_external_id, season)

        log "Done. Imported: #{result[:imported]}"
        result
      end

      private

      def upsert_standings(data, league_external_id, season)
        league = League.find_by(external_id: league_external_id)

        unless league
          log_error "League not found: #{league_external_id}"
          return { imported: 0, error: 'League not found' }
        end

        team_ids = Team.pluck(:external_id, :id).to_h
        groups   = data['groups'] || []
        records  = []

        groups.each do |group|
          group_name = group['name']

          group['standings'].each do |standing|
            team_id = team_ids[standing['team']['id']]

            unless team_id
              ensure_team_exists(standing['team'])
              team_id = Team.find_by(external_id: standing['team']['id'])&.id
            end

            next unless team_id

            records << {
              league_id:       league.id,
              team_id:         team_id,
              season:          season,
              group_name:      group_name,
              position:        standing['position'],
              points:          standing['points'],
              games_played:    standing['total']['games'],
              wins:            standing['total']['wins'],
              draws:           standing['total']['draws'],
              loses:           standing['total']['loses'],
              scored_goals:    standing['total']['scoredGoals'],
              received_goals:  standing['total']['receivedGoals'],
              home_played:     standing['home']['games'],
              home_wins:       standing['home']['wins'],
              home_draws:      standing['home']['draws'],
              home_loses:      standing['home']['loses'],
              away_played:     standing['away']['games'],
              away_wins:       standing['away']['wins'],
              away_draws:      standing['away']['draws'],
              away_loses:      standing['away']['loses'],
              created_at:      Time.current,
              updated_at:      Time.current
            }
          end
        end

        return { imported: 0 } if records.blank?

        Standing.upsert_all(
          records,
          unique_by: %i[league_id team_id season],
          update_only: %i[
            position points games_played wins draws loses
            scored_goals received_goals
            home_played home_wins home_draws home_loses
            away_played away_wins away_draws away_loses
          ]
        )

        { imported: records.size }
      rescue StandardError => e
        log_error "Failed to upsert standings: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end

      def ensure_team_exists(team_data)
        Team.upsert_all(
          [ {
            external_id: team_data['id'],
            name:        team_data['name'].strip,
            logo:        team_data['logo'],
            created_at:  Time.current,
            updated_at:  Time.current
          } ],
          unique_by: :external_id,
          update_only: %i[name logo]
        )
      end
    end
  end
end
