RSpec.describe Interactors::CacheWarmup::Leagues do
  let!(:country) { create(:country) }
  let!(:league1) { create(:league, country: country) }
  let!(:league2) { create(:league, country: country) }

  after do
    RedisService.del("league:#{league1.id}")
    RedisService.del("league:#{league2.id}")
  end

  describe '#call' do
    it 'caches all leagues in Redis' do
      described_class.call
      expect(RedisService.get("league:#{league1.id}")).to be_present
      expect(RedisService.get("league:#{league2.id}")).to be_present
    end

    it 'succeeds' do
      result = described_class.call
      expect(result).to be_success
    end
  end
end
