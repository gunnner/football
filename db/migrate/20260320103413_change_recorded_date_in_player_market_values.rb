class ChangeRecordedDateInPlayerMarketValues < ActiveRecord::Migration[8.1]
  def up
    safety_assured do
      execute <<~SQL
        ALTER TABLE player_market_values
        ALTER COLUMN recorded_date TYPE date
        USING recorded_date::date
      SQL
    end
  end

  def down
    safety_assured do
      execute <<~SQL
        ALTER TABLE player_market_values
        ALTER COLUMN recorded_date TYPE varchar
        USING recorded_date::varchar
      SQL
    end
  end
end
