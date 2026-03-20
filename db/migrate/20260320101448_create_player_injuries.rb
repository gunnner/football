class CreatePlayerInjuries < ActiveRecord::Migration[8.1]
  def change
    create_table :player_injuries do |t|
      t.references :player, null: false, foreign_key: true
      t.string     :reason, null: false
      t.string     :season
      t.string     :from_date
      t.string     :to_date
      t.integer    :missed_games,          default: 0
      t.integer    :absent_duration_days,  default: 0

      t.timestamps
    end

    add_index :player_injuries, %i[player_id from_date]
  end
end
