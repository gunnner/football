RSpec.describe Favorite, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:favoritable) }
  end

  describe 'validations' do
    subject { build(:favorite, :league) }

    it { is_expected.to validate_inclusion_of(:favoritable_type).in_array(Favorite::FAVORITABLE_TYPES) }

    it 'validates uniqueness of favoritable per user' do
      user   = create(:user)
      league = create(:league)
      create(:favorite, user: user, favoritable: league)

      duplicate = build(:favorite, user: user, favoritable: league)
      expect(duplicate).not_to be_valid
    end
  end
end
