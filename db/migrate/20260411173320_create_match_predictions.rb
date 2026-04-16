class CreateMatchPredictions < ActiveRecord::Migration[8.1]
  def change
    create_table :match_predictions do |t|
      t.references :match, null: false, foreign_key: true
      t.string  :prediction_type, null: false
      t.decimal :home_pct, precision: 5, scale: 2
      t.decimal :draw_pct, precision: 5, scale: 2
      t.decimal :away_pct, precision: 5, scale: 2
      t.datetime :generated_at, null: false
      t.timestamps
    end

    add_index :match_predictions, %i[match_id prediction_type generated_at],
              unique: true, name: 'idx_match_predictions_unique'
  end
end
