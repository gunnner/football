class Standing < ApplicationRecord
  belongs_to :league
  belongs_to :team

  validates :season,   presence: true
  validates :position, presence: true
  validates :points,   presence: true
  validates :team_id,  uniqueness: { scope: %i[league_id season] }

  scope :ordered,    -> { order(position: :asc) }
  scope :for_season, ->(season) { where(season: season) }
end
