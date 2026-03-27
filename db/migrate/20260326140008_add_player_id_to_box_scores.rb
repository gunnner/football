class AddPlayerIdToBoxScores < ActiveRecord::Migration[8.1]
  def change
    add_column :box_scores, :player_id, :integer
    add_index  :box_scores, :player_id
    add_index  :box_scores, %i[player_id match_id], unique: true
  end
end
