class Team < ApplicationRecord
  include Searchable

  after_commit :invalidate_cache

  has_many :home_matches,
            class_name:  'Match',
            foreign_key: :home_team_id,
            dependent:   :destroy
  has_many :away_matches,
            class_name:  'Match',
            foreign_key: :away_team_id,
            dependent:   :destroy
  has_many :standings,                   dependent: :destroy
  has_many :team_statistics,             dependent: :destroy
  has_many :favorites, as: :favoritable, dependent: :destroy

  validates :external_id, presence: true, uniqueness: true
  validates :name, presence: true

  normalizes :name, with: -> { it.strip }

  settings index: { number_of_shards: 1 } do
    mapping dynamic: false do
      indexes :name,        type: :text,   analyzer: :english
      indexes :name_exact,  type: :keyword
      indexes :external_id, type: :integer
    end
  end

  scope :in_active_leagues, -> {
    league_ids    = League.where(external_id: FootballConfig.active_league_ids)
    latest_season = Standing.where(league_id: league_ids).maximum(:season)
    joins(:standings).where(standings: {
        league_id: league_ids,
        season:    latest_season
      }
    ).distinct
  }

  def as_indexed_json(_ = {})
    {
      name:        name,
      name_exact:  name,
      external_id: external_id,
      logo:        logo
    }
  end

  def matches
    Match.where(home_team: self).or(Match.where(away_team: self))
  end

  def form
    matches.where(status: 'Finished').order(date: :desc).limit(5)
  end

  def players
    Player.joins(:box_scores)
          .where(box_scores: { team_external_id: external_id })
          .distinct
  end

  def leagues
    League.joins(:standings)
          .where(standings: { team_id: id })
          .distinct
  end

  def max_player_avg_rating_by_team
    season = Match.joins(:league)
                  .where(leagues: { external_id: FootballConfig.active_league_ids })
                  .maximum(:season)
    return unless season

    best_player, best_rating = nil, nil

    players.includes(:box_scores).each do |p|
      rating = p.average_rating_for_season(season)
      next unless rating

      if best_rating.nil? || rating > best_rating
        best_rating = rating
        position = p.box_scores
                    .joins(:match)
                    .where(matches: { season: season })
                    .where.not(position: [ nil, '' ])
                    .order('matches.date DESC')
                    .pick(:position)
        best_player = { id: p.id, name: p.name, logo: p.logo, position: position, rating: rating }
      end
    end

    best_player
  end

  private

  def invalidate_cache
    CacheService::Store.invalidate(CacheService::Keys.team(id))
    CacheService::Store.invalidate(CacheService::Keys.team_statistics(id, nil))
    CacheService::Store.invalidate_pattern("team:#{id}:*")
  end
end
