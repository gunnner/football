module TeamPresenters
  class FormPresenter
    def initialize(team)
      @team = team
    end

    def call
      team.form.includes(:home_team, :away_team).map do |match|
        home_score, away_score = match.score_current.to_s.scan(/\d+/).map(&:to_i)
        is_home  = match.home_team_id == team.id
        opponent = is_home ? match.away_team : match.home_team
        won      = is_home ? home_score > away_score : away_score > home_score
        drew     = home_score.eql? away_score

        {
          id:             match.id,
          path:           "/matches/#{match.id}",
          date:           match.date.strftime('%d %b %Y'),
          score:          match.score_current,
          result:         won ? 'W' : drew ? 'D' : 'L',
          home_team_name: match.home_team.name,
          away_team_name: match.away_team.name,
          opponent_name:  opponent.name,
          opponent_logo:  opponent.logo
        }
      end
    end

    private

    attr_reader :team
  end
end
