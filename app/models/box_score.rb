class BoxScore < ApplicationRecord
  belongs_to :match
  belongs_to :player, optional: true

  validates :team_external_id, presence: true

  scope :starters,    -> { where(is_substitute: false) }
  scope :substitutes, -> {  where(is_substitute: true) }
  scope :for_team,    ->(team_external_id) { where(team_external_id: team_external_id) }

  def self.link_players!
    where(player_id: nil)
      .where.not(player_external_id: nil)
      .find_each do |box_score|
        player = Player.find_by(external_id: box_score.player_external_id)
        box_score.update_column(:player_id, player.id) if player
      end
  end
end
