class MatchSerializer
  include JSONAPI::Serializer

  attributes :external_id,
             :date,
             :status,
             :round,
             :clock,
             :updated_at,
             :score_current,
             :score_penalties,
             :venue_name,
             :venue_city,
             :venue_country,
             :venue_capacity,
             :referee_name,
             :referee_nationality,
             :forecast_status,
             :forecast_temperature

  attribute :referee_country_logo do |match|
    Country.find_by(name: match.referee_nationality)&.logo
  end

  belongs_to :league,    serializer: LeagueSerializer
  belongs_to :home_team, serializer: TeamSerializer
  belongs_to :away_team, serializer: TeamSerializer
end
