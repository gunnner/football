class CreatePlayers < ActiveRecord::Migration[8.1]
  def change
    create_table :players do |t|
      t.bigint :external_id, null: false
      t.string :name,        null: false
      t.string :full_name
      t.string :logo

      t.timestamps
    end

    add_index :players, :external_id, unique: true
    add_index :players, :name
  end
end
