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

  attribute :country_logo do |team|
    Country.find_by(name: team.country)&.logo
  end
end
