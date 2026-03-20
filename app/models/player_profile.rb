class PlayerProfile < ApplicationRecord
  belongs_to :player

  FOOT_OPTIONS = %w[left right both].freeze

  validates :player_id, uniqueness: true
  validates :foot, inclusion: { in: FOOT_OPTIONS }, allow_blank: true
end
