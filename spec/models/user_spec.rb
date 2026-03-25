RSpec.describe User, type: :model do
  describe 'validations' do
    subject { build(:user) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
  end

  describe 'associations' do
    it { is_expected.to have_many(:favorites).dependent(:destroy) }
    it { is_expected.to have_one(:user_preference).dependent(:destroy) }
  end

  describe 'enums' do
    it { is_expected.to define_enum_for(:role).with_values(regular: 0, admin: 1) }
  end

  describe '#full_name' do
    it 'returns full name' do
      user = build(:user, first_name: '   John  ', last_name: '  Doe    ')
      expect(user.full_name).to eq('John Doe')
    end

    it 'handles missing last name' do
      user = build(:user, first_name: 'John', last_name: nil)
      expect(user.full_name).to eq('John')
    end
  end

  describe '#admin?' do
    it 'returns true for admin' do
      expect(build(:user, :admin).admin?).to be true
    end

    it 'returns false for regular user' do
      expect(build(:user).admin?).to be false
    end
  end
end
