RSpec.describe TokenBlacklistService do
  let(:user)  { create(:user) }
  let(:token) { JwtService.encode(user_id: user.id) }

  after { RedisService.del(TokenBlacklistService.send(:key, token)) }

  describe '.add' do
    it 'adds token to blacklist' do
      described_class.add(token)
      expect(described_class.blacklisted?(token)).to be true
    end

    it 'does nothing for invalid token' do
      expect { described_class.add('invalid.token') }.not_to raise_error
    end

    it 'does nothing for expired token' do
      expired = JwtService.encode(user_id: user.id, exp: 1.hour.ago.to_i)
      expect { described_class.add(expired) }.not_to raise_error
    end
  end

  describe '.blacklisted?' do
    it 'returns false for non-blacklisted token' do
      expect(described_class.blacklisted?(token)).to be false
    end

    it 'returns true after token is added' do
      described_class.add(token)
      expect(described_class.blacklisted?(token)).to be true
    end
  end
end
