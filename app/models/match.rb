class Match < ApplicationRecord
  include MatchConstants

  after_commit :invalidate_cache
  after_commit :broadcast_changes, on: :update

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

  scope :live,     -> { where(status: MatchConstants::LIVE_STATUSES) }
  scope :finished, -> { where(status: MatchConstants::FINISHED_STATUSES) }
  scope :upcoming, -> { where(status: MatchConstants::NOT_STARTED).where('date > ?', Time.current) }
  scope :today,    -> { where(date: Time.current.beginning_of_day..Time.current.end_of_day) }
  scope :h2h,      ->(team1_id, team2_id) {
    where(home_team_id: team1_id, away_team_id: team2_id)
      .or(where(home_team_id: team2_id, away_team_id: team1_id))
      .order(date: :desc)
  }

  private

  def invalidate_cache
    CacheService::Store.invalidate(CacheService::Keys.today_matches)
    CacheService::Store.invalidate(CacheService::Keys.live_matches)
    CacheService::Store.invalidate(CacheService::Keys.match(id))
    CacheService::Store.invalidate(CacheService::Keys.match_events(id))
    CacheService::Store.invalidate(CacheService::Keys.match_statistics(id))
    CacheService::Store.invalidate(CacheService::Keys.match_lineup(id))
  end

  def broadcast_changes
    return unless saved_changes.key?(:status) || saved_changes.key?(:score_current)

    MatchBroadcastService.broadcast_update(self)
    broadcast_status_change if saved_changes.key?(:status)
  end

  def broadcast_status_change
    old_status = saved_changes[:status]&.first
    new_status = status

    if new_status.in?(Match::LIVE_STATUSES) && !old_status.in?(Match::LIVE_STATUSES)
      MatchBroadcastService.broadcast_match_start(self)
    elsif new_status.in?(%w[Finished Finished\ after\ penalties Finished\ after\ extra\ time])
      MatchBroadcastService.broadcast_match_end(self)
    end
  end
end
