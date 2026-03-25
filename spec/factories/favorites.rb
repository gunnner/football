FactoryBot.define do
  factory :favorite do
    association :user

    trait :league do
      association :favoritable, factory: :league
    end

    trait :team do
      association :favoritable, factory: :team
    end

    trait :player do
      association :favoritable, factory: :player
    end
  end
end
