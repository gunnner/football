FactoryBot.define do
  factory :box_score do
    team_external_id { 42 }
    team_name        { 'Olympique Lyonnais' }
    player_name      { 'Endrick' }
    position         { 'Forward' }
    shirt_number     { 16 }
    is_captain       { false }
    is_substitute    { false }
    minutes_played   { 90 }
    match_rating     { '8.00' }
    goals_scored     { 1 }
    assists          { 0 }
    shots_total      { 3 }
    shots_on_target  { 2 }
    passes_total     { 25 }
    passes_accuracy  { '78.57 %' }

    association :match
  end
end
