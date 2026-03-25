FactoryBot.define do
  factory :user do
    sequence(:email)      { "user#{it}@example.com" }
    password              { 'password123' }
    password_confirmation { 'password123' }
    first_name            { 'John' }
    last_name             { 'Doe' }
    role                  { :regular }

    trait :admin do
      role { :admin }
    end
  end
end
