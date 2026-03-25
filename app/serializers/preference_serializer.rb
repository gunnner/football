class PreferenceSerializer
  include JSONAPI::Serializer

  attributes :timezone, :notification_settings

  attribute :default_league do |preference|
    preference.default_league&.name
  end

  attribute :notifications do |preference|
    preference.notifications
  end
end
