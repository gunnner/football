class Team < ApplicationRecord
  after_commit :invalidate_cache

  has_many :home_matches,
            class_name:  'Match',
            foreign_key: :home_team_id,
            dependent:   :destroy
  has_many :away_matches,
            class_name:  'Match',
            foreign_key: :away_team_id,
            dependent:   :destroy
  has_many :standings,       dependent: :destroy
  has_many :team_statistics, dependent: :destroy

  validates :external_id, presence: true, uniqueness: true
  validates :name, presence: true

  normalizes :name, with: -> { it.strip }

  def matches
    Match.where(home_team: self).or(Match.where(away_team: self))
  end

  private

  def invalidate_cache
    CacheService::Store.invalidate(CacheService::Keys.team(id))
    CacheService::Store.invalidate(CacheService::Keys.team_statistics(id, nil))
    CacheService::Store.invalidate_pattern("team:#{id}:*")
  end
end
