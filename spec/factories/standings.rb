FactoryBot.define do
  factory :standing do
    season       { 2024 }
    position     { 1 }
    points       { 63 }
    games_played { 28 }
    wins         { 20 }
    draws        { 3 }
    loses        { 5 }

    association  :league
    association  :team
  end
end
