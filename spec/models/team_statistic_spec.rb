RSpec.describe TeamStatistic, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:team) }
  end

  describe 'validations' do
    subject { build(:team_statistic) }

    it { is_expected.to validate_presence_of(:season) }
  end

  describe 'scopes' do
    let!(:team)   { create(:team) }
    let!(:stat24) { create(:team_statistic, team: team, season: 2024) }
    let!(:stat23) { create(:team_statistic, team: team, season: 2023, league_external_id: 999) }

    describe '.for_season' do
      it 'returns statistics for given season' do
        expect(TeamStatistic.for_season(2024)).to     include(stat24)
        expect(TeamStatistic.for_season(2024)).not_to include(stat23)
      end
    end
  end
end
