class BoxScore < ApplicationRecord
  belongs_to :match

  validates :team_external_id, presence: true

  scope :starters,    -> { where(is_substitute: false) }
  scope :substitutes, -> {  where(is_substitute: true) }
  scope :for_team,    ->(team_external_id) { where(team_external_id: team_external_id) }
end
