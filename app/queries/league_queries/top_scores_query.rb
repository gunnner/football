module LeagueQueries
  class TopScoresQuery
    def initialize(league, season)
      @league = league
      @season = season
    end

    def call
      Player.joins(:player_statistics)
            .where(player_statistics: { league: league.name, season: season.to_s })
            .order('player_statistics.goals DESC')
            .limit(20)
    end

    private

    attr_reader :league, :season
  end
end
