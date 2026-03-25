class CreateUserPreferences < ActiveRecord::Migration[8.1]
  def change
    create_table :user_preferences do |t|
      t.references :user, null: false, foreign_key: true
      t.string     :timezone, default: 'UTC', null: false
      t.integer    :default_league_id
      t.jsonb      :notification_settings, default: {}, null: false

      t.timestamps
    end

    # add_index :user_preferences, :user_id, unique: true
    add_index :user_preferences, :notification_settings, using: :gin
  end
end
