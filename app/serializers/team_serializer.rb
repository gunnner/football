class TeamSerializer
  include JSONAPI::Serializer

  attributes :external_id,
             :name,
             :logo,
             :country,
             :founded,
             :coach_name,
             :venue_name,
             :venue_city,
             :venue_capacity
end
