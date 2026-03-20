class League < ApplicationRecord
  belongs_to :country

  has_many :matches, dependent: :destroy
  has_many :standings, dependent: :destroy

  validates :external_id, presence: true, uniqueness: true
  validates :name, presence: true

  normalizes :name, with: -> { it.strip }

  attribute :seasons, :integer, array: true, default: []

  scope :by_country, ->(country_code) {
    joins(:country).where(countries: { code: country_code })
  }
end
