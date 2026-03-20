FactoryBot.define do
  factory :match_lineup do
    team_external_id { 42 }
    team_name        { 'Montpellier' }
    formation        { '4-2-3-1' }
    substitutes      { [ { 'name' => 'Raolisoa', 'number' => 27, 'position' => 'Defender' } ] }
    initial_lineup   {
      [
        [ { 'name' => 'Fofana', 'number' => 30, 'position' => 'Goalkeeper' } ],
        [ { 'name' => 'Hanin',  'number' => 26, 'position' => 'Defender' } ]
      ]
    }

    association :match
  end
end
