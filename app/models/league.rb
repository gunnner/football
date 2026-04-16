class League < ApplicationRecord
  include Searchable

  after_commit :invalidate_cache

  belongs_to :country

  has_many :matches,                     dependent: :destroy
  has_many :standings,                   dependent: :destroy
  has_many :favorites, as: :favoritable, dependent: :destroy

  def teams
    current = matches.maximum(:season)
    season_matches = matches.where(season: current).select(:id)
    Team.where(id: Match.where(id: season_matches).select(:home_team_id))
        .or(Team.where(id: Match.where(id: season_matches).select(:away_team_id)))
  end

  def players
    Player.joins(box_scores: :match)
          .where(matches: { league_id: id })
          .distinct
  end


  validates :external_id, presence: true, uniqueness: true
  validates :name, presence: true

  normalizes :name, with: -> { it.strip }

  attribute :seasons, :integer, array: true, default: []

  scope :by_country, ->(country_code) {
    joins(:country).where(countries: { code: country_code })
  }

  settings index: { number_of_shards: 1 } do
    mappings dynamic: false do
      indexes :name,         type: :text,   analyzer: :english
      indexes :name_exact,   type: :keyword
      indexes :country_name, type: :text
      indexes :country_code, type: :keyword
    end
  end

  def as_indexed_json(_ = {})
    {
      name:         name,
      name_exact:   name,
      external_id:  external_id,
      logo:         logo,
      country_name: country&.name,
      country_code: country&.code
    }
  end

  private

  def invalidate_cache
    CacheService::Store.invalidate(CacheService::Keys.league(id))
    CacheService::Store.invalidate_pattern("league:#{id}:*")
  end
end
