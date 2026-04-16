class MatchNewsItem < ApplicationRecord
  belongs_to :match

  self.table_name = 'match_news'

  scope :recent, -> { order(published_at: :desc) }
end
