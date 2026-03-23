class AddUniqueIndexToMatchEvents < ActiveRecord::Migration[8.1]
  def change
    add_index :match_events,
              %i[match_id time type player_external_id],
              unique: true,
              name: 'index_match_events_unique'
  end
end
