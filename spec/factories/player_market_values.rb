FactoryBot.define do
  factory :player_market_value do
    recorded_date { Date.new(2023, 12, 22) }
    value         { 60_000_000 }
    currency      { '€' }
    club          { 'FC Barcelona' }
    age           { 28 }

    association :player
  end
end
