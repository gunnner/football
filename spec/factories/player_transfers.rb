FactoryBot.define do
  factory :player_transfer do
    team_from     { 'Inter' }
    team_to       { 'Bayern Munich' }
    transfer_type { 'loan' }
    season        { '19/20' }
    market_value  { '€30.0M' }
    fee           { '€5.0M' }
    transfer_date { 'Aug 13, 2019' }

    association :player
  end
end
