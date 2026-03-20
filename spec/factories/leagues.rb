FactoryBot.define do
  factory :league do
    sequence(:external_id) { it }
    sequence(:name)        { "League #{it}" }
    logo                   { 'https://example.com/logos/league/1.png' }
    seasons                { [ 2003, 2004 ] }

    association :country
  end
end
