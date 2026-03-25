RSpec.describe UserPreference, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:default_league).optional }
  end

  describe 'validations' do
    subject { build(:user_preference) }

    it { is_expected.to validate_inclusion_of(:timezone).in_array(UserPreference::TIMEZONES) }
  end

  describe '#notifications' do
    it 'merges defaults with saved settings' do
      preference = build(:user_preference, notification_settings: { 'goals' => false })
      expect(preference.notifications['goals']).to       be false
      expect(preference.notifications['match_start']).to be true
    end
  end

  describe '#notify_on?' do
    it 'returns true for enabled notifications' do
      preference = build(:user_preference)
      expect(preference.notify_on?(:match_start)).to be true
    end

    it 'returns false for disabled notifications' do
      preference = build(:user_preference, notification_settings: { 'match_start' => false })
      expect(preference.notify_on?(:match_start)).to be false
    end
  end

  describe 'normalization' do
    it 'normalizes Kyiv to Athens' do
      preference = create(:user_preference, timezone: 'Kyiv')
      expect(preference.timezone).to eq('Athens')
    end

    it 'keeps valid timezones unchanged' do
      preference = create(:user_preference, timezone: 'London')
      expect(preference.timezone).to eq('London')
    end
  end
end
