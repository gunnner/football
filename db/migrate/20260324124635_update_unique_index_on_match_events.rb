class UpdateUniqueIndexOnMatchEvents < ActiveRecord::Migration[8.1]
  def change
    remove_index :match_events, name: 'index_match_events_unique'

    add_index    :match_events,
                  %i[match_id time event_type player_external_id],
                  unique: true,
                  name: 'index_match_events_unique'
  end
end
