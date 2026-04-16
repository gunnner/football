class AddUniqueIndexesToPlayerProfilesAndMarketValues < ActiveRecord::Migration[8.1]
  def change
    safety_assured do
      remove_index :player_profiles,      :player_id
      add_index    :player_profiles,      :player_id,                  unique: true

      remove_index :player_market_values, %i[player_id recorded_date]
      add_index    :player_market_values, %i[player_id recorded_date], unique: true
    end
  end
end
