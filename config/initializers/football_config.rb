module FootballConfig
  ACTIVE_LEAGUES = [
    { name: 'Premier League', external_id: ENV.fetch('ACTIVE_LEAGUE_IDS'), country_code: 'GB-ENG' }
  ].freeze


  def self.active_league_ids
    ENV.fetch('ACTIVE_LEAGUE_IDS').split(',').map(&:to_i)
  end
end
