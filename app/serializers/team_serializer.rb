class TeamSerializer
  include JSONAPI::Serializer

  attributes :external_id, :name, :logo
end
