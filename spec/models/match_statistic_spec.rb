RSpec.describe MatchStatistic, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:match) }
  end

  describe 'validation' do
    subject { build(:match_statistic) }

    it { is_expected.to validate_presence_of(:display_name) }
  end
end
