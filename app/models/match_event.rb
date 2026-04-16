class MatchEvent < ApplicationRecord
  belongs_to :match

  after_commit :invalidate_match_cache

  TYPES = [
    'Goal', 'Own Goal', 'Penalty', 'Missed Penalty', 'Yellow Card', 'Substitution', 'VAR Goal Confirmed',
    'Red Card', 'VAR Goal Cancelled', 'VAR Penalty', 'VAR Penalty Cancelled', 'VAR Goal Cancelled - Offside'
   ].freeze

  def invalidate_match_cache
    CacheService::Store.invalidate(CacheService::Keys.match_events(match_id))
    CacheService::Store.invalidate(CacheService::Keys.match(match_id))
  end


  validates :time, presence: true
  validates :event_type, presence: true, inclusion: { in: TYPES }
end
