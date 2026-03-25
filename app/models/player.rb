class Player < ApplicationRecord
  include Searchable

  after_commit :invalidate_cache

  has_one  :player_profile,              dependent: :destroy
  has_many :player_statistics,           dependent: :destroy
  has_many :player_transfers,            dependent: :destroy
  has_many :player_injuries,             dependent: :destroy
  has_many :player_rumours,              dependent: :destroy
  has_many :player_market_values,        dependent: :destroy
  has_many :favorites, as: :favoritable, dependent: :destroy


  validates :external_id, presence: true, uniqueness: true
  validates :name,        presence: true

  normalizes :name,      with: -> { it.strip }
  normalizes :full_name, with: -> { it.strip }

  scope :search_by_name, ->(query) {
    where('name ILIKE ?', "%#{query}%")
  }

  settings index: { number_of_shards: 1 } do
    mappings dynamic: false do
      indexes :name,       type: :text,    analyzer: :english
      indexes :full_name,  type: :text,    analyzer: :english
      indexes :name_exact, type: :keyword
    end
  end

  def as_indexed_json(_ = {})
    {
      name:        name,
      full_name:   full_name,
      name_exact:  name,
      external_id: external_id,
      logo:        logo
    }
  end

  private

  def invalidate_cache
    CacheService::Store.invalidate(CacheService::Keys.player(id))
    CacheService::Store.invalidate(CacheService::Keys.player_profile(id))
    CacheService::Store.invalidate(CacheService::Keys.player_statistics(id))
    CacheService::Store.invalidate(CacheService::Keys.player_transfers(id))
  end
end
