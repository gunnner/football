class CreateMatchEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :match_events do |t|
      t.references :match, null: false, foreign_key: true
      t.bigint :team_external_id
      t.bigint :player_external_id
      t.bigint :assisting_player_external_id
      t.string :team_name
      t.string :team_logo
      t.string :time, null: false
      t.string :type, null: false
      t.string :player_name
      t.string :assisting_player_name
      t.string :substituted_player

      t.timestamps
    end

    add_index :match_events, %i[match_id time]
    add_index :match_events, :type
  end
end
