class MatchEvent < ApplicationRecord
  belongs_to :match

  TYPES = [
    'Goal', 'Own Goal', 'Penalty', 'Missed Penalty', 'Yellow Card', 'Substitution', 'VAR Goal Confirmed',
    'Red Card', 'VAR Goal Cancelled', 'VAR Penalty', 'VAR Penalty Cancelled', 'VAR Goal Cancelled - Offside'
  ]

  validates :time, presence: true
  validates :type, presence: true, inclusion: { in: TYPES }
end
