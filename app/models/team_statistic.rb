class TeamStatistic < ApplicationRecord
  belongs_to :team

  validates :season, presence: true

  scope :for_season, ->(season) { where(season: season) }
end
