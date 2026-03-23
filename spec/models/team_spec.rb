RSpec.describe Team, type: :model do
  describe 'associations' do
    it 'has many home_matches' do
      is_expected.to have_many(:home_matches).class_name('Match').dependent(:destroy)
    end

    it 'has many away_matches' do
      is_expected.to have_many(:away_matches).class_name('Match').dependent(:destroy)
    end

    it 'has many standings' do
      is_expected.to have_many(:standings).dependent(:destroy)
    end

    it 'has many team_statistics' do
      is_expected.to have_many(:team_statistics).dependent(:destroy)
    end
  end

  describe 'validations' do
    subject { build(:team) }

    it { is_expected.to validate_presence_of(:external_id) }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:external_id) }
  end

  describe 'normalization' do
    it 'strips whitespace from name' do
      team = build(:team, name: '  Manchester United  ')
      team.valid?
      expect(team.name).to eq('Manchester United')
    end
  end

  describe '#matches' do
    let!(:team)       { create(:team) }
    let!(:other_team) { create(:team) }
    let!(:home_match) { create(:match, home_team: team, away_team: other_team) }
    let!(:away_match) { create(:match, home_team: other_team, away_team: team) }
    let!(:unrelated)  { create(:match) }

    it 'returns all matches for team' do
      expect(team.matches).to     include(home_match, away_match)
      expect(team.matches).not_to include(unrelated)
    end
  end

  describe '#as_indexed_json' do
    let(:team) { create(:team, name: 'Manchester United', logo: 'https://example.com/logo.png') }

    it 'returns correct structure' do
      json = team.as_indexed_json
      expect(json).to include(
        name:        'Manchester United',
        name_exact:  'Manchester United',
        external_id: team.external_id,
        logo:        'https://example.com/logo.png'
      )
    end
  end
end
