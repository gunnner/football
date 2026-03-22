class AddUniqueIndexToMatchStatistics < ActiveRecord::Migration[8.1]
  def change
    add_index :match_statistics,
              %i[match_id team_external_id display_name],
              unique: true,
              name: 'index_match_statistics_unique'
  end
end
