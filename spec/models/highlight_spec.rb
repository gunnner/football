RSpec.describe Highlight, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:match) }
  end

  describe 'validations' do
    subject { build(:highlight) }

    it { is_expected.to validate_presence_of(:external_id) }
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:url) }
    it { is_expected.to validate_presence_of(:highlight_type) }
    it { is_expected.to validate_uniqueness_of(:external_id) }
    it { is_expected.to validate_inclusion_of(:highlight_type).in_array(Highlight::HIGHLIGHT_TYPES.values) }
  end

  describe 'scopes' do
    let!(:verified)   { create(:highlight, highlight_type: Highlight::HIGHLIGHT_TYPES[:verified]) }
    let!(:unverified) { create(:highlight, highlight_type: Highlight::HIGHLIGHT_TYPES[:unverified]) }

    describe '.verified' do
      it 'returns only verified highlights' do
        expect(Highlight.verified).to     include(verified)
        expect(Highlight.verified).not_to include(unverified)
      end
    end

    describe '.unverified' do
      it 'returns only unverified highlights' do
        expect(Highlight.unverified).to     include(unverified)
        expect(Highlight.unverified).not_to include(verified)
      end
    end
  end
end
