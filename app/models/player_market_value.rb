class PlayerMarketValue < ApplicationRecord
  belongs_to :player

  validates :recorded_date, presence: true
  validates :value,         presence: true
  validates :currency,      presence: true

  scope :chronological, -> { order(recorded_date: :asc) }
  scope :latest_first,  -> { order(recorded_date: :desc) }

  def self.latest_for(player)
    where(player: player).latest_first.first
  end
end
