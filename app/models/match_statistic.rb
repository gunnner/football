class MatchStatistic < ApplicationRecord
  belongs_to :match

  validates :display_name, presence: true
end
