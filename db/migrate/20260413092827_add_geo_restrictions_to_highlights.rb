class AddGeoRestrictionsToHighlights < ActiveRecord::Migration[8.1]
  def change
    add_column :highlights, :geo_state, :string
    add_column :highlights, :allowed_countries, :jsonb
    add_column :highlights, :blocked_countries, :jsonb
  end
end
