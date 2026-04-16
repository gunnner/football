class CreateMatchNews < ActiveRecord::Migration[8.1]
  def change
    create_table :match_news do |t|
      t.references :match, null: false, foreign_key: true
      t.string  :url,   null: false
      t.string  :title, null: false
      t.string  :image_url
      t.datetime :published_at
      t.timestamps
    end

    add_index :match_news, %i[match_id url], unique: true
  end
end
