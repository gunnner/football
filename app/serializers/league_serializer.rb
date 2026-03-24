class LeagueSerializer
  include JSONAPI::Serializer

  attributes :external_id, :name, :logo, :seasons

  belongs_to :country, serializer: CountrySerializer
end
