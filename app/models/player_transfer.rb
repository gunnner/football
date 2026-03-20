class PlayerTransfer < ApplicationRecord
  belongs_to :player

  TRANSFER_TYPES = {
    transfer:    'transfer',
    loan:        'loan',
    end_of_loan: 'end_of_loan'
  }.freeze

  validates :team_from,     presence: true
  validates :team_to,       presence: true
  validates :transfer_type, inclusion: { in: TRANSFER_TYPES.values }, allow_blank: true

  scope :loans,       -> { where(transfer_type: TRANSFER_TYPES[:loan]) }
  scope :transfers,   -> { where(transfer_type: TRANSFER_TYPES[:transfer]) }
  scope :end_of_loan, -> { where(transfer_type: TRANSFER_TYPES[:end_of_loan]) }
end
