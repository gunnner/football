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

  def fee_value
    return 0 if fee.blank?

    m = fee.gsub(/[€£$\s,]/, '') #clear string from currencies, spaces and commas

    case m
    when /M$/i then (m.to_f * 1_000_000).to_i
    when /K$/i then (m.to_f * 1_000).to_i
    else  m.to_f.to_i
    end
  end
end
