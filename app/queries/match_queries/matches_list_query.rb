module MatchQueries
  class MatchesListQuery
    def initialize(league_id, date)
      @league_id = league_id
      @date      = date
    end

    def call
      scope = Match.includes(:home_team, :away_team, :league)
      scope = scope.where(league_id: league_id)   if league_id.present?
      scope = scope.where('date::date = ?', date) if date.present?
      scope
    end

    private

    attr_reader :league_id, :date
  end
end
