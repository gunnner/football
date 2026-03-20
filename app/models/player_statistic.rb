class PlayerStatistic < ApplicationRecord
  belongs_to :player

  COMPETITION_TYPES = {
    national_league:   'national_league',
    national_cup:      'national_cup',
    international_cup: 'international_cup'
  }.freeze

  validates :club, presence: true
  validates :competition_type, inclusion: { in: COMPETITION_TYPES.values }, allow_blank: true

  scope :for_season,        ->(season) { where(season: season) }
  scope :for_club,          ->(club)   { where(club: club) }

  scope :national_league,   -> { where(competition_type: COMPETITION_TYPES[:national_league]) }
  scope :national_cup,      -> { where(competition_type: COMPETITION_TYPES[:national_cup]) }
  scope :international_cup, -> { where(competition_type: COMPETITION_TYPES[:international_cup]) }
end
