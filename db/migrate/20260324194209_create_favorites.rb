class CreateFavorites < ActiveRecord::Migration[8.1]
  def change
    create_table :favorites do |t|
      t.references :user,        null: false, foreign_key: true
      t.references :favoritable, null: false, polymorphic: true

      t.timestamps
    end

    add_index :favorites, %i[user_id favoritable_type favoritable_id],
              unique: true,
              name: 'index_favorites_unique'
  end
end
