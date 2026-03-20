class CreateLeagues < ActiveRecord::Migration[8.1]
  def change
    create_table :leagues do |t|
      t.bigint :external_id, null: false
      t.string :name, null: false
      t.string :logo
      t.references :country, null: false, foreign_key: true

      t.timestamps
    end

    add_index :leagues, :external_id, unique: true
    add_index :leagues, :name
  end
end
