FactoryBot.define do
  factory :player_injury do
    reason               { 'Muscle injury' }
    season               { '2022' }
    from_date            { '27.04.2022' }
    to_date              { '20.05.2022' }
    missed_games         { 3 }
    absent_duration_days { 24 }

    association :player
  end
end
