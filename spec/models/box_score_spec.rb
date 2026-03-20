RSpec.describe BoxScore, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:match) }
  end

  describe 'validations' do
    subject { build(:box_score) }

    it { is_expected.to validate_presence_of(:team_external_id) }
  end

  describe 'scopes' do
    let!(:match)     { create(:match) }
    let!(:starter)   { create(:box_score, match: match, is_substitute: false, team_external_id: 553) }
    let!(:sub)       { create(:box_score, match: match, is_substitute: true,  team_external_id: 553) }
    let!(:other)     { create(:box_score, match: match, is_substitute: false, team_external_id: 999) }

    describe '.starters' do
      it 'returns only starting players' do
        expect(BoxScore.starters).to     include(starter)
        expect(BoxScore.starters).not_to include(sub)
      end
    end

    describe '.substitutes' do
      it 'returns only substitute players' do
        expect(BoxScore.substitutes).to     include(sub)
        expect(BoxScore.substitutes).not_to include(starter)
      end
    end

    describe '.for_team' do
      it 'returns box scores for specific team' do
        expect(BoxScore.for_team(553)).to     include(starter, sub)
        expect(BoxScore.for_team(553)).not_to include(other)
      end
    end
  end
end
