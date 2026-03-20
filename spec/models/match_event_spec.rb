RSpec.describe MatchEvent, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:match) }
  end

  describe 'validations' do
    subject { build(:match_event) }

    it { is_expected.to validate_presence_of(:time) }
    it { is_expected.to validate_presence_of(:type) }
    it { is_expected.to validate_inclusion_of(:type).in_array(MatchEvent::TYPES) }
  end

  describe 'constants' do
    it 'has correct event types' do
      expect(MatchEvent::TYPES).to include('Goal', 'Yellow Card', 'Red Card', 'Substitution')
    end
  end
end
