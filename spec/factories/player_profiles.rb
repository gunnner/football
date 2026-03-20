FactoryBot.define do
  factory :player_profile do
    birth_date      { 'Feb 2, 1989' }
    birth_place     { 'Split' }
    citizenship     { 'Croatia' }
    foot            { 'both' }
    height          { '1,86 m' }
    main_position   { 'Right Winger' }
    current_club    { 'PSV Eindhoven' }
    contract_expiry { 'Jun 30, 2027' }

    association :player
  end
end
