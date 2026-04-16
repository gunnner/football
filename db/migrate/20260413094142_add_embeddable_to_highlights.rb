class AddEmbeddableToHighlights < ActiveRecord::Migration[8.1]
  def change
    add_column :highlights, :embeddable, :boolean
  end
end
