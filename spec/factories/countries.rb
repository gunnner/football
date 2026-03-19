FactoryBot.define do
  factory :country do
    sequence(:code) { |n| "C#{n}" }
    sequence(:name) { |n| "Country #{n}" }
    logo            { "https://example.com/logos/country/FR.png" }
  end
end
