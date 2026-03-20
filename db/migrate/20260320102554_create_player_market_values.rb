class CreatePlayerMarketValues < ActiveRecord::Migration[8.1]
  def change
    create_table :player_market_values do |t|
      t.references :player,        null: false, foreign_key: true
      t.string     :recorded_date, null: false
      t.bigint     :value,         null: false
      t.string     :currency,      null: false, default: '€'
      t.string     :club
      t.integer    :age

      t.timestamps
    end

    add_index :player_market_values, %i[player_id recorded_date]
  end
end
