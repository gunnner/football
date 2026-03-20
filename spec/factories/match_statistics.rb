FactoryBot.define do
  factory :match_statistic do
    team_name    { 'Arsenal' }
    display_name { 'Shots accuracy' }
    value        { 0.42 }

    association :match
  end
end
