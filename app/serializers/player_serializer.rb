class PlayerSerializer
  include JSONAPI::Serializer

  attributes :external_id, :name, :full_name, :logo

  has_one :player_profile, serializer: PlayerProfileSerializer
end
