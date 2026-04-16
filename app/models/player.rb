class Player < ApplicationRecord
  include Searchable

  after_commit :invalidate_cache

  has_one  :player_profile,              dependent: :destroy
  has_many :player_statistics,           dependent: :destroy
  has_many :player_transfers,            dependent: :destroy
  has_many :player_injuries,             dependent: :destroy
  has_many :player_rumours,              dependent: :destroy
  has_many :player_market_values,        dependent: :destroy
  has_many :box_scores,                  dependent: :destroy
  has_many :player_club_statistics,      dependent: :destroy
  has_many :favorites, as: :favoritable, dependent: :destroy

  validates :external_id, presence: true, uniqueness: true
  validates :name,        presence: true

  normalizes :name,      with: -> { it.strip }
  normalizes :full_name, with: -> { it.strip }

    # Some API country names differ from our DB names — map known variants
    COUNTRY_NAME_ALIASES = {
      "Cote d'Ivoire"          => 'Ivory Coast',
      "Côte d'Ivoire"          => 'Ivory Coast',
      'Korea Republic'         => 'South Korea',
      'Korea DPR'              => 'North Korea',
      'China PR'               => 'China',
      'USA'                    => 'United States',
      'Czech Republic'         => 'Czechia',
      'Republic of Ireland'    => 'Ireland',
      'Bosnia and Herzegovina' => 'Bosnia & Herzegovina',
      'Trinidad and Tobago'    => 'Trinidad & Tobago',
      'Antigua and Barbuda'    => 'Antigua & Barbuda',
      'Saint Kitts and Nevis'  => 'St. Kitts & Nevis'
    }.freeze

  scope :search_by_name, ->(query) {
    where('name ILIKE ?', "%#{query}%")
  }

  scope :in_active_leagues, -> {
    where(id: joins(box_scores: :match)
                .where(matches: { league_id: League.where(external_id: FootballConfig.active_league_ids) })
                .select('players.id'))
  }

  settings index: { number_of_shards: 1 } do
    mappings dynamic: false do
      indexes :name,       type: :text,    analyzer: :english
      indexes :full_name,  type: :text,    analyzer: :english
      indexes :name_exact, type: :keyword
    end
  end

  def teams
    Team.where(external_id: box_scores.distinct.pluck(:team_external_id))
  end

  def current_team
    Team.find_by(
      external_id: box_scores.joins(:match)
                             .order('matches.date DESC')
                             .pick(:team_external_id)
    )
  end

  def average_rating_for_season(season = nil)
    season ||= Match.joins(:league)
                    .where(leagues: { external_id: FootballConfig.active_league_ids })
                    .maximum(:season)
    return unless season

    ratings = box_scores.joins(:match)
                        .where(matches: { season: season })
                        .where.not(match_rating: [ nil, '' ])
                        .pluck(:match_rating)
                        .map(&:to_f)
                        .select(&:positive?)

    return if ratings.blank?

    (ratings.sum / ratings.size).round(2)
  end

  def national_flags
    return if player_profile.blank?

    citizenships = player_profile.citizenship.split(', ')
    citizenships.map do |name|
      resolved = COUNTRY_NAME_ALIASES[name] || name
      Country.find_by(name: resolved)&.logo
    end.compact
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
