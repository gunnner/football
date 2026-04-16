class CreateMatchShots < ActiveRecord::Migration[8.1]
  def change
    create_table :match_shots do |t|
      t.references :match, null: false, foreign_key: true
      t.bigint :team_external_id, null: false
      t.string :player_name
      t.string :time
      t.string :outcome
      t.string :goal_target
      t.timestamps
    end
  end
end
