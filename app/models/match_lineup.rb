class MatchLineup < ApplicationRecord
  belongs_to :match

  validates :team_external_id, presence: true
end
