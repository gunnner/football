FactoryBot.define do
  factory :country do
    sequence(:code) { "C#{it}" }
    sequence(:name) { "Country #{it}" }
    logo            { "https://example.com/logos/country/FR.png" }
  end
end
