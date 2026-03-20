RSpec.describe PlayerInjury, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:player) }
  end

  describe 'validations' do
    subject { build(:player_injury) }

    it { is_expected.to validate_presence_of(:reason) }
  end
end
