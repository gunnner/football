class CreateTeamStatistics < ActiveRecord::Migration[8.1]
  def change
    create_table :team_statistics do |t|
      t.references :team,   null: false, foreign_key: true
      t.integer    :season, null: false
      t.bigint     :league_external_id
      t.string     :league_name

      t.integer    :total_played, default: 0
      t.integer    :total_wins,   default: 0
      t.integer    :total_loses,  default: 0
      t.integer    :total_draws,  default: 0
      t.integer    :total_scored,   default: 0
      t.integer    :total_received, default: 0

      t.integer    :home_played,   default: 0
      t.integer    :home_wins,     default: 0
      t.integer    :home_loses,    default: 0
      t.integer    :home_draws,    default: 0
      t.integer    :home_scored,   default: 0
      t.integer    :home_received, default: 0

      t.integer    :away_played,   default: 0
      t.integer    :away_wins,     default: 0
      t.integer    :away_loses,    default: 0
      t.integer    :away_draws,    default: 0
      t.integer    :away_scored,   default: 0
      t.integer    :away_received, default: 0

      t.timestamps
    end

    add_index :team_statistics, %i[team_id season league_external_id], unique: true, name: 'index_team_stats_unique'
  end
end
