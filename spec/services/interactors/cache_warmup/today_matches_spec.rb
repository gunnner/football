RSpec.describe Interactors::CacheWarmup::TodayMatches do
  after do
    RedisService.del(CacheService::Keys.live_matches)
  end

  describe '#call' do
    it 'succeeds' do
      result = described_class.call
      expect(result).to be_success
    end

    it 'writes live matches key to Redis' do
      described_class.call
      expect(RedisService.get(CacheService::Keys.live_matches)).to be_present
    end

    context 'when live matches exist' do
      let!(:match) { create(:match, status: 'First half', date: 30.minutes.ago) }

      it 'caches live match data' do
        described_class.call
        cached = JSON.parse(RedisService.get(CacheService::Keys.live_matches))
        expect(cached).to be_an(Array)
        expect(cached.map { |m| m['id'] }).to include(match.id)
      end
    end
  end
end
