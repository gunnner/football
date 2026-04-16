module MatchQueries
  class StandingsQuery
    def initialize(match)
      @match = match
    end

    def call
      season = match.league.seasons.max
      Standing.where(league: match.league, season: season).includes(:team).ordered.map do |s|
        {
          position:         s.position,
          team_name:        s.team.name,
          team_external_id: s.team.external_id,
          logo:             s.team.logo,
          team_path:        "/teams/#{s.team.id}",
          games_played:     s.games_played,
          wins:             s.wins,
          draws:            s.draws,
          loses:            s.loses,
          scored_goals:     s.scored_goals,
          received_goals:   s.received_goals,
          points:           s.points,
          home_wins:        s.home_wins,
          home_draws:       s.home_draws,
          home_loses:       s.home_loses,
          away_wins:        s.away_wins,
          away_draws:       s.away_draws,
          away_loses:       s.away_loses
        }
      end
    end

    private

    attr_reader :match
  end
end
