class CreatePlayerTransfers < ActiveRecord::Migration[8.1]
  def change
    create_table :player_transfers do |t|
      t.references :player,    null: false, foreign_key: true
      t.string     :team_from, null: false
      t.string     :team_to,   null: false
      t.string     :transfer_type
      t.string     :season
      t.string     :market_value
      t.string     :fee
      t.string     :transfer_date

      t.timestamps
    end

    add_index :player_transfers, %i[player_id transfer_date]
  end
end
