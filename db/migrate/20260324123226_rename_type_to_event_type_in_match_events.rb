class RenameTypeToEventTypeInMatchEvents < ActiveRecord::Migration[8.1]
  def change
    safety_assured do
       rename_column :match_events, :type, :event_type
    end
  end
end
