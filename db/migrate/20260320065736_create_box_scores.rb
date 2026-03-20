class CreateBoxScores < ActiveRecord::Migration[8.1]
  def change
    create_table :box_scores do |t|
      t.references :match, null: false, foreign_key: true
      t.bigint     :team_external_id, null: false
      t.string     :team_name
      t.string     :team_logo

      t.bigint     :player_external_id
      t.string     :player_name
      t.string     :player_full_name
      t.string     :player_logo
      t.string     :position
      t.integer    :shirt_number
      t.boolean    :is_captain,    default: false
      t.boolean    :is_substitute, default: false
      t.integer    :minutes_played
      t.string     :match_rating
      t.integer    :offsides

      t.integer    :goals_scored,    default: 0
      t.integer    :goals_saved,     default: 0
      t.integer    :goals_conceded,  default: 0

      t.integer    :shots_total,      default: 0
      t.integer    :shots_on_target,  default: 0
      t.integer    :shots_off_target, default: 0
      t.string     :shots_accuracy

      t.integer    :passes_total,      default: 0
      t.integer    :passes_successful, default: 0
      t.integer    :passes_failed,     default: 0
      t.integer    :passes_key,        default: 0
      t.string     :passes_accuracy

      t.integer    :dribbles_total,      default: 0
      t.integer    :dribbles_successful, default: 0
      t.integer    :dribbles_failed,     default: 0
      t.string     :dribble_success_rate

      t.integer    :duels_total,   default: 0
      t.integer    :duels_won,     default: 0
      t.integer    :duels_lost,    default: 0
      t.string     :duel_success_rate

      t.integer    :tackles_total,       default: 0
      t.integer    :interceptions_total, default: 0
      t.integer    :fouled_by_others,    default: 0
      t.integer    :fouled_others,       default: 0

      t.integer    :cards_yellow,        default: 0
      t.integer    :cards_red,           default: 0
      t.integer    :cards_second_yellow, default: 0

      t.integer    :penalties_scored,   default: 0
      t.integer    :penalties_missed,   default: 0
      t.integer    :penalties_total,    default: 0
      t.string     :penalties_accuracy

      t.integer    :assists, default: 0

      t.float      :expected_goals
      t.float      :expected_assists
      t.float      :expected_goals_on_target
      t.float      :expected_goals_on_target_conceded
      t.float      :expected_goals_prevented

      t.timestamps
    end

    add_index :box_scores, %i[match_id team_external_id]
    add_index :box_scores, %i[match_id player_external_id]
  end
end
