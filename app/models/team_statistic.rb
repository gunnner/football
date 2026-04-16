class TeamStatistic < ApplicationRecord
  belongs_to :team

  validates :season, presence: true

  scope :for_season, ->(season) { where(season: season) }

  after_commit -> { CacheService::Store.invalidate(CacheService::Keys.team_statistics(team_id, season)) }
end
