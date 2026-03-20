RSpec.describe Standing, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:league) }
    it { is_expected.to belong_to(:team) }
  end

  describe 'validations' do
    subject { build(:standing) }

    it { is_expected.to validate_presence_of(:season) }
    it { is_expected.to validate_presence_of(:position) }
    it { is_expected.to validate_presence_of(:points) }
    it { is_expected.to validate_uniqueness_of(:team_id).scoped_to(:league_id, :season) }
  end

  describe 'scopes' do
    let!(:league)    { create(:league) }
    let!(:standing1) { create(:standing, league: league, season: 2024, position: 2) }
    let!(:standing2) { create(:standing, league: league, season: 2024, position: 1) }
    let!(:standing3) { create(:standing, league: league, season: 2023, position: 1) }

    describe '.for_season' do
      it 'returns standings for given season' do
        expect(Standing.for_season(2024)).to     include(standing1, standing2)
        expect(Standing.for_season(2024)).not_to include(standing3)
      end
    end

    describe '.ordered' do
      it 'returns standings ordered by position' do
        expect(Standing.ordered.first).to eq(standing2)
        expect(Standing.ordered.last).to  eq(standing1)
      end
    end
  end
end
