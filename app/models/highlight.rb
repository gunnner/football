class Highlight < ApplicationRecord
  belongs_to :match

  HIGHLIGHT_TYPES = {
    verified:   'VERIFIED',
    unverified: 'UNVERIFIED'
  }.freeze

  validates :external_id,    presence: true, uniqueness: true
  validates :highlight_type, presence: true, inclusion: { in: HIGHLIGHT_TYPES.values }
  validates :title,          presence: true
  validates :url,            presence: true

  scope :verified,   -> { where(highlight_type: HIGHLIGHT_TYPES[:verified]) }
  scope :unverified, -> { where(highlight_type: HIGHLIGHT_TYPES[:unverified]) }
end
