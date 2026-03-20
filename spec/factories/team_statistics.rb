FactoryBot.define do
  factory :team_statistic do
    season             { 2024 }
    league_external_id { 216_087 }
    league_name        { 'Major League Soccer' }
    total_played       { 34 }
    total_wins         { 20 }
    total_loses        { 5 }
    total_draws        { 5 }
    total_scored       { 57 }
    total_received     { 39 }

    association :team
  end
end
