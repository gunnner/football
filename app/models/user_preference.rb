class UserPreference < ApplicationRecord
  belongs_to :user
  belongs_to :default_league,
              class_name:  'League',
              foreign_key: :default_league_id,
              optional:    true

  TIMEZONES = ActiveSupport::TimeZone.all.map(&:name).freeze

  DEFAULT_NOTIFICATIONS = {
    'match_start' => true,
    'goals'       => true,
    'match_end'   => true,
    'standings'   => false
  }.freeze

  TIMEZONE_ALIASES = {
    'Kyiv' => 'Athens'
  }.freeze

  before_validation :normalize_timezone

  validates :timezone, inclusion: { in: TIMEZONES }

  def notifications
    DEFAULT_NOTIFICATIONS.merge(notification_settings)
  end

  def notify_on?(event)
    notifications[event.to_s]
  end

  private

  def normalize_timezone
    self.timezone = TIMEZONE_ALIASES.fetch(timezone, timezone)
  end
end
