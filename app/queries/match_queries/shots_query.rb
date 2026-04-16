module MatchQueries
  class ShotsQuery
    def initialize(match)
      @match = match
    end

    def call
      shots = match.match_shots.order(:time)
      names = shots.map(&:player_name).compact_blank.uniq
      player_paths = Player.where(name: names)
                           .pluck(:name, :id)
                           .each_with_object({}) { |(name, id), h| h[name] = "/players/#{id}" }
      shots.map do |shot|
        shot.as_json.merge('player_path' => player_paths[shot.player_name])
      end
    end

    private

    attr_reader :match
  end
end
