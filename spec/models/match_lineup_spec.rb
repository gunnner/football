RSpec.describe MatchLineup, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:match) }
  end

  describe 'validations' do
    subject { build(:match_lineup) }

    it { is_expected.to validate_presence_of(:team_external_id) }
  end

  describe 'jsonb fields' do
    let(:lineup) { create(:match_lineup) }

    it 'stores initial_lineup as array' do
      expect(lineup.initial_lineup).to be_an(Array)
      expect(lineup.initial_lineup.first.first['position']).to eq('Goalkeeper')
    end

    it 'stores substitutes as array' do
      expect(lineup.substitutes).to be_an(Array)
      expect(lineup.substitutes.first['position']).to eq('Defender')
    end
  end
end
