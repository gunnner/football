class PlayerClubStatistic < ApplicationRecord
  belongs_to :player

  validates :club, presence: true
end
