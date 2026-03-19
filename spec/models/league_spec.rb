RSpec.describe League, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:country) }

    pending 'have many matches' do
      is_expected.to have_many(:matches).dependent(:destroy)
    end

    pending 'have many standings' do
      is_expected.to have_many(:standings).dependent(:destroy)
    end
  end

  describe 'validations' do
    subject { build(:league) }

    it { is_expected.to validate_presence_of(:external_id) }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:external_id) }
  end

  describe 'scopes' do
    describe '.by_country' do
      let!(:ukraine) { create(:country, code: 'UA', name: 'Ukraine') }
      let!(:france)  { create(:country, code: 'FR', name: 'France') }
      let!(:upl)     { create(:league, country: ukraine, name: 'UPL') }
      let!(:ligue_1)  { create(:league, country: france, name: 'Ligue 1') }

      it 'returns leagues for given country code' do
        expect(League.by_country('UA')).to     include(upl)
        expect(League.by_country('UA')).not_to include(ligue_1)
      end
    end

    describe 'normalization' do
      it 'strips whitespace from name' do
        league = build(:league, name: '     Premier League    ')
        league.valid?
        expect(league.name).to eq('Premier League')
      end
    end
  end
end
