FactoryBot.define do
  factory :user_preference do
    timezone              { 'UTC' }
    notification_settings { {} }

    association :user

    trait :kyiv do
      timezone { 'Kyiv' }
    end

    trait :all_notifications do
      notification_settings do
        {
          'match_start' => true,
          'goals'       => true,
          'match_end'   => true,
          'standings'   => true
        }
      end
    end
  end
end
