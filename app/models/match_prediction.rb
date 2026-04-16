class MatchPrediction < ApplicationRecord
  belongs_to :match

  scope :live,     -> { where(prediction_type: 'live') }
  scope :prematch, -> { where(prediction_type: 'prematch') }

  def self.latest_live(match_id)
    where(match_id: match_id, prediction_type: 'live').order(generated_at: :desc).first
  end

  def self.latest_prematch(match_id)
    where(match_id: match_id, prediction_type: 'prematch').order(generated_at: :desc).first
  end
end
