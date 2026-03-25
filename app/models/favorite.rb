class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :favoritable, polymorphic: true

  FAVORITABLE_TYPES = %w[League Team Player].freeze

  validates :favoritable_type, inclusion: { in: Favorite::FAVORITABLE_TYPES }
  validates :favoritable_id, uniqueness:  { scope: %w[user_id favoritable_type] }
end
