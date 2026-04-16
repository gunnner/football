module PlayerQueries
  class TransfersQuery
    def initialize(player)
      @player = player
    end

    def call
      team_names = player.player_transfers.flat_map { [ it.team_from, it.team_to ] }.uniq
      teams      = Team.where(name: team_names).pluck(:name, :id, :logo)
                        .each_with_object({}) { |(name, id, logo), h| h[name] = { id: id, logo: logo } }

      player.player_transfers.order(created_at: :desc).map do |transfer|
        transfer.as_json.merge(
          team_from_logo: teams.dig(transfer.team_from, :logo),
          team_from_path: teams.dig(transfer.team_from, :id)&.then { "/teams/#{it}" },
          team_to_logo:   teams.dig(transfer.team_to, :logo),
          team_to_path:   teams.dig(transfer.team_to, :id)&.then { "/teams/#{it}" },
          fee_value:      transfer.fee_value
        )
      end
    end

    attr_reader :player
  end
end
