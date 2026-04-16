module MatchQueries
  class PlayerIdMapQuery
    def initialize(match)
      @match = match
    end

    # Returns Hash: { external_id => { id:, logo: } }
    def call
      lineup_ext_ids = match.match_lineups.flat_map { |l|
        (l.initial_lineup.flatten + l.substitutes).map { |p| p['id'] }
      }.compact

      event_ext_ids = match.match_events.flat_map { |e|
        [ e.player_external_id, e.assisting_player_external_id ]
      }.compact

      Player.where(external_id: (lineup_ext_ids + event_ext_ids).uniq)
            .pluck(:external_id, :id, :logo)
            .each_with_object({}) { |(ext_id, id, logo), h| h[ext_id] = { id: id, logo: logo } }
    end

    private

    attr_reader :match
  end
end
