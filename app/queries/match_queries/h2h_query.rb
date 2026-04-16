module MatchQueries
  class H2hQuery
    def initialize(team1_id, team2_id)
      @team1_id = team1_id
      @team2_id = team2_id
    end

    def call
      db_matches = Match.h2h(team1_id, team2_id)
                        .where(status: MatchConstants::FINISHED_STATUSES)
                        .where.not(score_current: nil)
                        .order(date: :desc)
                        .includes(:home_team, :away_team)
                        .limit(10)

      db_matches.map {  h2h_match_from_db(it) }
    end

    private

    attr_reader :team1_id, :team2_id

    def h2h_match_from_db(match)
      {
        match_path:    "/matches/#{match.id}",
        score_current: match.score_current,
        date:          match.date,
        home_team:     { name: match.home_team.name, logo: match.home_team.logo },
        away_team:     { name: match.away_team.name, logo: match.away_team.logo }
      }
    end
  end
end
