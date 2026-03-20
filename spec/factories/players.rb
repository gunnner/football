FactoryBot.define do
  factory :player do
    sequence(:external_id) { it }
    sequence(:name)        { "Player #{it}" }
    full_name              { 'Ivan Perisic' }
    logo                   { 'https://example.com/players/1.png' }
  end
end
