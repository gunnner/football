RSpec.describe Country, type: :model do
  describe 'associations' do
    pending 'has many leagues' do
      is_expected.to have_many(:leagues).dependent(:destroy)
    end
  end

  describe 'validations' do
    subject { build(:country) }

    it { is_expected.to validate_presence_of(:code) }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:code).case_insensitive }
  end

  describe 'normalization' do
    it 'upcases code' do
      country = build(:country, code: 'fr')
      country.valid?
      expect(country.code).to eq('FR')
    end

    it 'strips whitespaces from name' do
      country = build(:country, name: "  France  ")
      country.valid?
      expect(country.name).to eq('France')
    end
  end
end
