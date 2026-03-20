class CreateMatchStatistics < ActiveRecord::Migration[8.1]
  def change
    create_table :match_statistics do |t|
      t.references :match, null: false, foreign_key: true
      t.bigint     :team_external_id
      t.string     :team_name
      t.string     :team_logo
      t.string     :display_name, null: false
      t.float      :value

      t.timestamps
    end

    add_index :match_statistics, %i[match_id team_external_id]
  end
end
