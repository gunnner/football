class CreatePlayerClubStatistics < ActiveRecord::Migration[8.1]
  def change
    create_table :player_club_statistics do |t|
      t.references :player, null: false, foreign_key: true

      t.string  :club, null: false

      t.integer :goals,               default: 0
      t.integer :assists,             default: 0
      t.integer :games_played,        default: 0
      t.integer :minutes_played,      default: 0
      t.integer :yellow_cards,        default: 0
      t.integer :red_cards,           default: 0
      t.integer :second_yellow_cards, default: 0
      t.integer :clean_sheets,        default: 0
      t.integer :goals_conceded,      default: 0
      t.integer :own_goals,           default: 0
      t.integer :penalties_scored,    default: 0
      t.integer :substituted_in,      default: 0
      t.integer :substituted_out,     default: 0

      t.timestamps
    end

    add_index :player_club_statistics, %i[player_id club], unique: true
  end
end
