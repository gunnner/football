class LeagueSerializer
  include JSONAPI::Serializer

  attributes :external_id, :name, :logo, :seasons

  attribute :country_name do |league|
    league.country&.name
  end

  attribute :country_code do |league|
    league.country&.code
  end

  attribute :country_logo do |league|
    league.country&.logo
  end

  belongs_to :country, serializer: CountrySerializer
end
