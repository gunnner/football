class LeagueSerializer
  include JSONAPI::Serializer

  attributes :external_id, :name, :logo, :seasons

  attribute :country_name do |league|
    league.country&.name
  end

  belongs_to :country, serializer: CountrySerializer
end
