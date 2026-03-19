class Country < ApplicationRecord
  has_many :leagues, dependent: :destroy

  validates :code, presence: true, uniqueness: true
  validates :name, presence: true

  normalizes :code, with: -> { it.upcase.strip }
  normalizes :name, with: -> { it.strip }
end
