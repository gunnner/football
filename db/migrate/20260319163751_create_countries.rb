class CreateCountries < ActiveRecord::Migration[8.1]
  def change
    create_table :countries do |t|
      t.string :name, null: false
      t.string :code, null: false
      t.string :logo

      t.timestamps
    end

    add_index :countries, :code, unique: true
    add_index :countries, :name
  end
end
