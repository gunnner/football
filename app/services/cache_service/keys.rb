module CacheService
  module Keys
    def self.today_matches
      "matches:today:#{Date.today}"
    end

    def self.live_matches
      'matches:live'
    end

    def self.match(id)
      "match:#{id}"
    end

    def self.match_events(id)
      "match:#{id}:events"
    end

    def self.match_statistics(id)
      "match:#{id}:statistics"
    end

    def self.match_lineup(id)
      "match:#{id}:lineup"
    end

    def self.match_box_scores(id)
      "match:#{id}:box_scores"
    end

    def self.league(id)
      "league:#{id}"
    end

    def self.league_standings(league_id, season)
      "league:#{league_id}:standings:#{season}"
    end

    def self.league_by_country(code)
      "leagues:country:#{code}"
    end

    def self.team(id)
      "team:#{id}:show"
    end

    def self.team_statistics(team_id, season)
      "team:#{team_id}:statistics:#{season}"
    end

    def self.team_matches(team_id)
        "team:#{team_id}:matches"
    end

    def self.player(id)
       "player:#{id}"
    end

    def self.player_profile(id)
      "player:#{id}:profile"
    end

    def self.player_statistics(id)
      "player:#{id}:statistics"
    end

    def self.player_transfers(id)
       "player:#{id}:transfers"
    end

    def self.top_scorers(league_id, season)
      "league:#{league_id}:top_scorers:#{season}"
    end
  end
end
