module MatchConstants
  extend ActiveSupport::Concern

  STATUSES = [
    'Not started', 'First half', 'Second half', 'Half time', 'Extra time', 'Break time', 'Penalties',
    'Finished', 'Finished after penalties', 'Finished after extra time', 'Postponed', 'Suspended',
    'Cancelled', 'Awarded', 'Interrupted', 'Abandoned', 'In progress', 'Unknown', 'To be announced'
  ].freeze

  LIVE_STATUSES = [
    'First half', 'Second half', 'Half time', 'Extra time', 'Break time', 'Penalties', 'In progress'
  ].freeze

  FINISHED_STATUSES = [
    'Finished', 'Finished after penalties', 'Finished after extra time'
  ].freeze

  NOT_STARTED = 'Not started'.freeze
end
