FactoryBot.define do
  factory :player_rumour do
    club                 { 'FC Barcelona' }
    rumour_date          { 'Jun 11, 2025' }
    transfer_probability { '84.96%' }
    is_current           { true }

    association :player
  end
end
