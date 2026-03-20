class CreateMatchLineups < ActiveRecord::Migration[8.1]
  def change
    create_table :match_lineups do |t|
      t.references :match, null: false, foreign_key: true
      t.bigint     :team_external_id, null: false
      t.string     :team_name
      t.string     :team_logo
      t.string     :formation
      t.jsonb      :initial_lineup, default: []
      t.jsonb      :substitutes,    default: []

      t.timestamps
    end

    add_index :match_lineups, %i[match_id team_external_id], unique: true
    add_index :match_lineups, :initial_lineup, using: :gin
    add_index :match_lineups, :substitutes,    using: :gin
  end
end
