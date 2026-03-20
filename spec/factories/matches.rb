FactoryBot.define do
  factory :match do
    sequence(:external_id) { it }
    date                   { 1.day.from_now }
    status                 { 'Not started' }
    round                  { 'Regular Season - 1' }

    association :league
    association :home_team, factory: :team
    association :away_team, factory: :team
  end
end
