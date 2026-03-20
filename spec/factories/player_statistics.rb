# spec/factories/player_statistics.rb
FactoryBot.define do
  factory :player_statistic do
    club             { 'PSV Eindhoven' }
    league           { 'Eredivisie' }
    season           { '2024' }
    competition_type { 'national_league' }
    goals            { 9 }
    assists          { 5 }
    games_played     { 20 }
    minutes_played   { 1800 }
    yellow_cards     { 2 }

    association :player
  end
end
