RSpec.describe Interactors::CacheWarmup::TodayMatches do
  let!(:today_match) { create(:match, date: Time.current) }

  after do
    RedisService.del('matches:today')
  end

  describe '#call' do
    it 'caches today matches in Redis' do
      described_class.call
      expect(RedisService.get(CacheService::Keys.today_matches)).to be_present
    end

    it 'succeeds' do
      result = described_class.call
      expect(result).to be_success
    end
  end
end
