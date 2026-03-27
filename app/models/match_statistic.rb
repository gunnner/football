class MatchStatistic < ApplicationRecord
  INTEGER_METRICS = [
    'Free Kicks', 'Big Chances Created', 'Successful Crosses', 'Crosses', 'Passes Own Half',
    'Passes Opposition Half', 'Successful Long Passes', 'Long Passes', 'Throw-Ins', 'Key Passes',
    'Passes Into Final Third', 'Backward Passes', 'Goal Kicks', 'Interceptions', 'Successful Tackles',
    'Tackles', 'Clearances', 'Successful Aerial Duels', 'Aerial Duels', 'Successful Dribbles', 'Dribbles',
    'Failed passes', 'Shots on target', 'Corners', 'Offsides', 'Successful passes', 'Shots off target',
    'Blocked shots', 'Shots within penalty area', 'Total passes', 'Shots outside penalty area',
    'Total passes', 'Shots outside penalty area', 'Goalkeeper saves', 'Fouls', 'Yellow cards'
  ].freeze

  belongs_to :match

  validates :display_name, presence: true
end
