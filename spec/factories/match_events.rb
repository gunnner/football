FactoryBot.define do
  factory :match_event do
    time        { '42' }
    event_type  { 'Goal' }
    team_name   { 'Arsenal' }
    player_name { 'Saka' }

    association :match
  end
end
