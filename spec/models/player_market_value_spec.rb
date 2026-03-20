RSpec.describe PlayerMarketValue, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:player) }
  end

  describe 'validations' do
    subject { build(:player_market_value) }

    it { is_expected.to validate_presence_of(:recorded_date) }
    it { is_expected.to validate_presence_of(:value) }
    it { is_expected.to validate_presence_of(:currency) }
  end

  describe 'scopes' do
    let!(:player) { create(:player) }
    let!(:old)    { create(:player_market_value, player: player, recorded_date: Date.new(2022, 1, 1), value: 10_000_000) }
    let!(:recent) { create(:player_market_value, player: player, recorded_date: Date.new(2023, 12, 22), value: 60_000_000) }

    describe '.latest_first' do
      it 'returns values newest first' do
        expect(PlayerMarketValue.latest_first.first).to eq(recent)
      end
    end

    describe '.chronological' do
      it 'returns values oldest first' do
        expect(PlayerMarketValue.chronological.first).to eq(old)
      end
    end
  end

  describe '.latest_for' do
    let!(:player) { create(:player) }
    let!(:old)    { create(:player_market_value, player: player, recorded_date: Date.new(2022, 1, 1), value: 10_000_000) }
    let!(:recent) { create(:player_market_value, player: player, recorded_date: Date.new(2023, 12, 22), value: 60_000_000) }

    it 'returns the most recent market value for a player' do
      expect(PlayerMarketValue.latest_for(player)).to eq(recent)
    end
  end
end
