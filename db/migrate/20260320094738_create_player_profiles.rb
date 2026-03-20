class CreatePlayerProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :player_profiles do |t|
      t.references :player, null: false, foreign_key: true
      t.string     :birth_date
      t.string     :birth_place
      t.string     :citizenship
      t.string     :foot
      t.string     :height
      t.string     :main_position
      t.string     :secondary_positions
      t.string     :current_club
      t.string     :joined_at
      t.string     :contract_expiry

      t.timestamps
    end
  end
end
