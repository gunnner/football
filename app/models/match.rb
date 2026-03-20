class Match < ApplicationRecord
  include MatchConstants

  belongs_to :league
  belongs_to :home_team, class_name: 'Team'
  belongs_to :away_team, class_name: 'Team'

  has_many :match_events,     dependent: :destroy
  has_many :match_statistics, dependent: :destroy
  has_many :match_lineups,    dependent: :destroy
  has_many :box_scores,       dependent: :destroy
  has_many :highlights,       dependent: :destroy

  validates :external_id, presence: true, uniqueness: true
  validates :date,        presence: true
  validates :status,      presence: true

  validates :status, inclusion: { in: STATUSES }

  scope :live,     -> { where(status: LIVE_STATUSES) }
  scope :finished, -> { where(status: FINISHED_STATUSES) }
  scope :upcoming, -> { where(status: NOT_STARTED).where('date > ?', Time.current) }
  scope :today,    -> { where(date: Time.current.beginning_of_day..Time.current.end_of_day) }
  scope :h2h,      ->(team1_id, team2_id) {
    where(home_team_id: team1_id, away_team_id: team2_id)
      .or(where(home_team_id: team2_id, away_team_id: team1_id))
      .order(date: :desc)
  }
end
