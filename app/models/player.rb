class Player < ApplicationRecord
  after_commit :invalidate_cache

  has_one  :player_profile,       dependent: :destroy
  has_many :player_statistics,    dependent: :destroy
  has_many :player_transfers,     dependent: :destroy
  has_many :player_injuries,      dependent: :destroy
  has_many :player_rumours,       dependent: :destroy
  has_many :player_market_values, dependent: :destroy

  validates :external_id, presence: true, uniqueness: true
  validates :name,        presence: true

  normalizes :name,      with: -> { it.strip }
  normalizes :full_name, with: -> { it.strip }

  scope :search_by_name, ->(query) {
    where('name ILIKE ?', "%#{query}%")
  }

  private

  def invalidate_cache
    CacheService::Store.invalidate(CacheService::Keys.player(id))
    CacheService::Store.invalidate(CacheService::Keys.player_profile(id))
    CacheService::Store.invalidate(CacheService::Keys.player_statistics(id))
    CacheService::Store.invalidate(CacheService::Keys.player_transfers(id))
  end
end
