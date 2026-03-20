RSpec.describe PlayerTransfer, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:player) }
  end

  describe 'validations' do
    subject { build(:player_transfer) }

    it { is_expected.to validate_presence_of(:team_from) }
    it { is_expected.to validate_presence_of(:team_to) }
    it do
      is_expected.to validate_inclusion_of(:transfer_type)
        .in_array(PlayerTransfer::TRANSFER_TYPES.values)
        .allow_blank
    end
  end

  describe 'scopes' do
    let!(:player)   { create(:player) }
    let!(:loan)     { create(:player_transfer, player: player, transfer_type: 'loan') }
    let!(:transfer) { create(:player_transfer, player: player, transfer_type: 'transfer') }

    describe '.loans' do
      it 'returns only loan transfers' do
        expect(PlayerTransfer.loans).to     include(loan)
        expect(PlayerTransfer.loans).not_to include(transfer)
      end
    end

    describe '.transfers' do
      it 'returns only permanent transfers' do
        expect(PlayerTransfer.transfers).to     include(transfer)
        expect(PlayerTransfer.transfers).not_to include(loan)
      end
    end
  end
end
