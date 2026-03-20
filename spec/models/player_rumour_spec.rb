RSpec.describe PlayerRumour, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:player) }
  end

  describe 'validations' do
    subject { build(:player_rumour) }

    it { is_expected.to validate_presence_of(:club) }
  end

  describe 'scopes' do
    let!(:player)         { create(:player) }
    let!(:current_rumour) { create(:player_rumour, player: player, is_current: true) }
    let!(:old_rumour)     { create(:player_rumour, player: player, is_current: false) }

    describe '.current' do
      it 'returns only current rumours' do
        expect(PlayerRumour.current).to     include(current_rumour)
        expect(PlayerRumour.current).not_to include(old_rumour)
      end
    end

    describe '.historical' do
      it 'returns only historical rumours' do
        expect(PlayerRumour.historical).to     include(old_rumour)
        expect(PlayerRumour.historical).not_to include(current_rumour)
      end
    end
  end
end
