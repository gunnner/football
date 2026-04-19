module MatchQueries
  class ShotsQuery
    def initialize(match)
      @match = match
    end

    def call
      shots = match.match_shots.order(:time)
      names = shots.map(&:player_name).compact_blank.uniq
      player_info = Player.where(name: names)
                          .pluck(:name, :id, :logo)
                          .each_with_object({}) { |(name, id, logo), h| h[name] = { path: "/players/#{id}", logo: logo } }
      shots.map do |shot|
        info = player_info[shot.player_name]
        shot.as_json.merge('player_path' => info&.dig(:path), 'player_logo' => info&.dig(:logo))
      end
    end

    private

    attr_reader :match
  end
end
