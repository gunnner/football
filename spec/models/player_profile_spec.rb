RSpec.describe PlayerProfile, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:player) }
  end

  describe 'validations' do
    subject { build(:player_profile) }

    it { is_expected.to validate_uniqueness_of(:player_id) }
    it { is_expected.to validate_inclusion_of(:foot).in_array(PlayerProfile::FOOT_OPTIONS).allow_blank }
  end
end
