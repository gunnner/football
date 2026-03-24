class StandingSerializer
  include JSONAPI::Serializer

  attributes :position,
             :points,
             :season,
             :group_name,
             :games_played,
             :wins,
             :draws,
             :loses,
             :scored_goals,
             :received_goals

  belongs_to :team, serializer: TeamSerializer
end
