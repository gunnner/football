class CreateMatches < ActiveRecord::Migration[8.1]
  def change
    create_table :matches do |t|
      t.bigint   :external_id, null: false
      t.string   :round
      t.datetime :date,   null: false
      t.string   :status, null: false, default: 'Not started'
      t.integer  :clock
      t.string   :score_current
      t.string   :score_penalties

      t.references :league,    null: false, foreign_key: true
      t.references :home_team, null: false, foreign_key: { to_table: :teams }
      t.references :away_team, null: false, foreign_key: { to_table: :teams }

      t.string  :venue_name
      t.string  :venue_city
      t.string  :venue_country
      t.integer :venue_capacity
      t.string  :referee_name
      t.string  :referee_nationality
      t.string  :forecast_status
      t.string  :forecast_temperature

      t.timestamps
    end

    add_index :matches, :external_id, unique: true
    add_index :matches, :date
    add_index :matches, :status
    add_index :matches, %i[home_team_id away_team_id]
    add_index :matches, %i[league_id date]
  end
end
