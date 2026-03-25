class MatchEvent < ApplicationRecord
  belongs_to :match

  after_commit :broadcast_goal, on: :update

  TYPES = [
    'Goal', 'Own Goal', 'Penalty', 'Missed Penalty', 'Yellow Card', 'Substitution', 'VAR Goal Confirmed',
    'Red Card', 'VAR Goal Cancelled', 'VAR Penalty', 'VAR Penalty Cancelled', 'VAR Goal Cancelled - Offside'
  ]

  validates :time, presence: true
  validates :event_type, presence: true, inclusion: { in: TYPES }

  private

  def broadcast_goal
    return if !event_type.eql?('Goal') || !event_type.eql?('Penalty')

    MatchBroadcastService.broadcast_goal(match, self)
  end
end
