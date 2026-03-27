class AddUniqueIndexToBoxScores < ActiveRecord::Migration[8.1]
  def change
    add_index :box_scores,
              %i[match_id player_external_id],
              unique: true,
              name:   'index_box_scores_on_match_and_player'
  end
end
