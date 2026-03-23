RSpec.describe CacheService::Keys do
  describe '.today_matches' do
    it 'includes today date' do
      expect(described_class.today_matches).to include(Date.today.to_s)
    end
  end

  describe '.match' do
    it 'returns correct key' do
      expect(described_class.match(1)).to eq('match:1')
    end
  end

  describe '.league' do
    it 'returns correct key' do
      expect(described_class.league(42)).to eq('league:42')
    end
  end

  describe '.league_standings' do
    it 'returns correct key' do
      expect(described_class.league_standings(42, 2024)).to eq('league:42:standings:2024')
    end
  end

  describe '.team' do
    it 'returns correct key' do
      expect(described_class.team(1)).to eq('team:1')
    end
  end

  describe '.player' do
    it 'returns correct key' do
      expect(described_class.player(1)).to eq('player:1')
    end
  end

  describe '.player_profile' do
    it 'returns correct key' do
      expect(described_class.player_profile(1)).to eq('player:1:profile')
    end
  end
end
