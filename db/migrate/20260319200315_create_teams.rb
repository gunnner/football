class CreateTeams < ActiveRecord::Migration[8.1]
  def change
    create_table :teams do |t|
      t.bigint :external_id, null: false
      t.string :name,        null: false
      t.string :logo

      t.timestamps
    end

    add_index :teams, :external_id, unique: true
    add_index :teams, :name
  end
end
