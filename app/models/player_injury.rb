class PlayerInjury < ApplicationRecord
  belongs_to :player

  validates :reason, presence: true
end
