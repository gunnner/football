FactoryBot.define do
  factory :team do
    sequence(:external_id) { it }
    sequence(:name)        { "Team #{it}" }
    logo                   { 'https://example.com/logos/team/1.png' }
  end
end
