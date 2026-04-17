RSpec.describe Interactors::CacheWarmup::Leagues do
  let!(:country) { create(:country) }
  let!(:league1) { create(:league, country: country, external_id: FootballConfig.active_league_ids.first) }
  let(:season)   { Date.today.year - 1 }

  after do
    RedisService.del(CacheService::Keys.league_standings(league1.id, season))
  end

  describe '#call' do
    it 'succeeds' do
      result = described_class.call
      expect(result).to be_success
    end

    context 'when standings exist for the league' do
      let!(:team) { create(:team) }
      let!(:standing) { create(:standing, league: league1, season: season, team: team) }

      it 'caches standings in Redis' do
        described_class.call
        expect(RedisService.get(CacheService::Keys.league_standings(league1.id, season))).to be_present
      end
    end

    context 'when standings are empty' do
      it 'does not write to Redis' do
        described_class.call
        expect(RedisService.get(CacheService::Keys.league_standings(league1.id, season))).to be_nil
      end
    end
  end
end
