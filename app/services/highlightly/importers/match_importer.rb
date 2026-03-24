module Highlightly
  module Importers
    class MatchImporter < BaseImporter
      def call(date: Date.today, limit: 100, league_id: nil)
        log "Starting matches import for #{date}..."

        params = { date: date.to_s, limit: limit }
        params[:leagueId] = league_id if league_id.present?

        data = @client.matches(params)
        return if data.blank?

        result = upsert_matches(data)

        log "Done. Imported: #{result[:imported]}"
        result
      end

      private

      def upsert_matches(data)
        return { imported: 0 } if data.blank?

        ensure_teams_exist(data)
        ensure_leagues_exist(data)

        team_ids   = Team.pluck(:external_id, :id).to_h
        league_ids = League.pluck(:external_id, :id).to_h

        records = data.filter_map do |match|
          home_team_id = team_ids[match['homeTeam']['id']]
          away_team_id = team_ids[match['awayTeam']['id']]
          league_id    = league_ids[match['league']['id']]

          next unless home_team_id && away_team_id && league_id

          {
            external_id:     match['id'],
            league_id:       league_id,
            home_team_id:    home_team_id,
            away_team_id:    away_team_id,
            date:            match['date'],
            status:          match['state']['description'],
            round:           match['round'],
            clock:           match['state']['clock'],
            score_current:   match['state']['score']['current'],
            score_penalties: match['state']['score']['penalties'],
            created_at:      Time.current,
            updated_at:      Time.current
          }
        end

        Match.upsert_all(
          records,
          unique_by: :external_id,
          update_only: %i[status clock score_current score_penalties]
        )

        { imported: records.size }
      rescue StandardError => e
        log_error "Failed to upsert matches: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end

      def ensure_teams_exist(data)
        existing_ids = Team.pluck(:external_id).to_set

        new_teams = data.flat_map { |match| [ match['homeTeam'], match['awayTeam'] ] }
                        .uniq     { |team| team['id'] }
                        .reject   { |team| team['id'].in?(existing_ids) }

        return if new_teams.blank?

        Team.upsert_all(
          new_teams.map do |team|
            {
              external_id: team['id'],
              name:        team['name'].strip,
              logo:        team['logo'],
              created_at:  Time.current,
              updated_at:  Time.current
            }
          end,
          unique_by: :external_id,
          update_only: %i[name logo]
        )
      end

      def ensure_leagues_exist(data)
        existing_ids  = League.pluck(:external_id).to_set
        country_codes = Country.pluck(:code, :id).to_h

        new_leagues = data.map    { |match| match['league'].merge('country' => match['country']) }
                          .uniq   { |league| league['id'] }
                          .reject { |league| league['id'].in?(existing_ids) }

        return if new_leagues.blank?

        records = new_leagues.filter_map do |league|
          country_id = country_codes[league['country']['code']]
          next unless country_id

          {
            external_id: league['id'],
            name:        league['name'].strip,
            logo:        league['logo'],
            country_id:  country_id,
            seasons:     [ league['season'] ],
            created_at:  Time.current,
            updated_at:  Time.current
          }
        end

        League.upsert_all(
          records,
          unique_by: :external_id,
          update_only: %i[name logo seasons]
        )
      end
    end
  end
end
