class CreateStandings < ActiveRecord::Migration[8.1]
  def change
    create_table :standings do |t|
      t.references :league,         null: false, foreign_key: true
      t.references :team,           null: false, foreign_key: true
      t.integer    :season,         null: false
      t.integer    :position,       null: false
      t.integer    :points,         null: false, default: 0
      t.integer    :games_played,   default: 0
      t.integer    :wins,           default: 0
      t.integer    :draws,          default: 0
      t.integer    :loses,          default: 0
      t.integer    :scored_goals,   default: 0
      t.integer    :received_goals, default: 0
      t.integer    :home_played,    default: 0
      t.integer    :home_wins,      default: 0
      t.integer    :home_draws,     default: 0
      t.integer    :home_loses,     default: 0
      t.integer    :away_played,    default: 0
      t.integer    :away_wins,      default: 0
      t.integer    :away_draws,     default: 0
      t.integer    :away_loses,     default: 0
      t.string     :group_name

      t.timestamps
    end

    add_index :standings, %i[league_id season]
    add_index :standings, %i[league_id season team_id], unique: true
    add_index :standings, :position
  end
end
