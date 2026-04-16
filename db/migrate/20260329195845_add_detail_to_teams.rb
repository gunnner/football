class AddDetailToTeams < ActiveRecord::Migration[8.1]
  def change
    add_column :teams, :country,        :string
    add_column :teams, :founded,        :integer
    add_column :teams, :venue_name,     :string
    add_column :teams, :venue_city,     :string
    add_column :teams, :venue_capacity, :integer
    add_column :teams, :coach_name,     :string
  end
end
