module MatchQueries
  class LastFiveQuery
    def initialize(match, team)
      @match = match
      @team  = team
    end

    def call
      Match.finished
           .where('home_team_id = :id OR away_team_id = :id', id: team.id)
           .where.not(id: match.id)
           .order(date: :desc)
           .limit(5)
           .includes(:home_team, :away_team)
           .map { |m| build_row(m) }
    end

    private

    attr_reader :match, :team

    def build_row(m)
      is_home       = m.home_team_id == team.id
      score         = m.score_current.to_s
      parts         = score.split('-').map { |p| Integer(p) rescue nil }
      goals_for     = is_home ? parts[0] : parts[1]
      goals_against = is_home ? parts[1] : parts[0]

      result =
        if goals_for.nil? || goals_against.nil? then 'U'
        elsif goals_for > goals_against         then 'W'
        elsif goals_for < goals_against         then 'L'
        else                                         'D'
        end

      {
        match_id:  m.id,
        date:      m.date.strftime('%b %d, %Y'),
        home_team: m.home_team.name,
        home_logo: m.home_team.logo,
        away_team: m.away_team.name,
        away_logo: m.away_team.logo,
        score:     score,
        result:    result,
        is_home:   is_home
      }
    end
  end
end
