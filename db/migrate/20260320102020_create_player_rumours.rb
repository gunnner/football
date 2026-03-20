class CreatePlayerRumours < ActiveRecord::Migration[8.1]
  def change
    create_table :player_rumours do |t|
      t.references :player, null: false, foreign_key: true
      t.string     :club,   null: false
      t.string     :rumour_date
      t.string     :transfer_probability
      t.boolean    :is_current, default: false, null: false

      t.timestamps
    end

    add_index :player_rumours, %i[player_id is_current]
  end
end
