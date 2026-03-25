RSpec.describe JwtService do
  let(:payload) { { user_id: 1 } }

  describe '.encode' do
    it 'returns a JWT token' do
      token = described_class.encode(payload)
      expect(token).to be_a(String)
      expect(token.split('.').length).to eq(3)
    end
  end

  describe '.decode' do
    it 'decodes a valid token' do
      token  = described_class.encode(payload)
      result = described_class.decode(token)
      expect(result[:user_id]).to eq(1)
    end

    it 'raises error for expired token' do
      token = described_class.encode(payload.merge(exp: 1.hour.ago.to_i))
      expect { described_class.decode(token) }.to raise_error(Highlightly::UnauthorizedError, /expired/)
    end

    it 'raises error for invalid token' do
      expect { described_class.decode('invalid.token.here') }.to raise_error(Highlightly::UnauthorizedError, /Invalid/)
    end
  end

  describe '.valid?' do
    it 'returns true for valid token' do
      token = described_class.encode(payload)
      expect(described_class.valid?(token)).to be true
    end

    it 'returns false for invalid token' do
      expect(described_class.valid?('bad_token')).to be false
    end
  end
end
