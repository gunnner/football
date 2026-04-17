RSpec.describe PlayerStatistic, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:player) }
  end

  describe 'validations' do
    subject { build(:player_statistic) }

    it { is_expected.to validate_presence_of(:club) }
    it do
      is_expected.to validate_inclusion_of(:competition_type)
        .in_array(PlayerStatistic::COMPETITION_TYPES.values)
        .allow_blank
    end
  end

  describe 'scopes' do
    let!(:player) { create(:player) }
    let!(:stat1)  { create(:player_statistic, player: player, season: '2024', club: 'PSV', competition_type: 'national_league') }
    let!(:stat2)  { create(:player_statistic, player: player, season: '2023', club: 'Inter', competition_type: 'international_competition') }

    describe '.for_season' do
      it 'returns statistics for given season' do
        expect(PlayerStatistic.for_season('2024')).to     include(stat1)
        expect(PlayerStatistic.for_season('2024')).not_to include(stat2)
      end
    end

    describe '.national_league' do
      it 'returns only national league statistics' do
        expect(PlayerStatistic.national_league).to     include(stat1)
        expect(PlayerStatistic.national_league).not_to include(stat2)
      end
    end
  end
end
