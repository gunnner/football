class MatchSerializer
  include JSONAPI::Serializer

  attributes :external_id,
             :date,
             :status,
             :round,
             :clock,
             :score_current,
             :score_penalties,
             :venue_name,
             :venue_city

  belongs_to :league,    serializer: LeagueSerializer
  belongs_to :home_team, serializer: TeamSerializer
  belongs_to :away_team, serializer: TeamSerializer
end
