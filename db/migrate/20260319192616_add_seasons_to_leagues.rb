class AddSeasonsToLeagues < ActiveRecord::Migration[8.1]
  def change
    add_column :leagues, :seasons, :integer, array: true, default: []
    add_index  :leagues, :seasons, using: :gin
  end
end
