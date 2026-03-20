class PlayerRumour < ApplicationRecord
  belongs_to :player

  validates :club, presence: true

  scope :current,    -> { where(is_current: true) }
  scope :historical, -> { where(is_current: false) }
end
