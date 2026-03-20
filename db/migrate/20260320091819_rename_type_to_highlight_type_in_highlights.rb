class RenameTypeToHighlightTypeInHighlights < ActiveRecord::Migration[8.1]
  def change
    safety_assured do
      rename_column :highlights, :type, :highlight_type
    end
  end
end
