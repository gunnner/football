class CreateHighlights < ActiveRecord::Migration[8.1]
  def change
    create_table :highlights do |t|
      t.references :match,          null: false, foreign_key: true
      t.bigint     :external_id,    null: false
      t.string     :highlight_type, null: false
      t.string     :title,          null: false
      t.string     :url,            null: false
      t.text       :description
      t.string     :embed_url
      t.string     :img_url
      t.string     :source
      t.string     :channel

      t.timestamps
    end

    add_index :highlights, :external_id, unique: true
    add_index :highlights, :highlight_type
  end
end
