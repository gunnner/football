class AddSeasonToMatches < ActiveRecord::Migration[8.1]
  def change
    add_column :matches, :season, :integer

    safety_assured do
      add_index :matches, :season
      add_index :matches, %i[league_id season]
    end
  end
end
