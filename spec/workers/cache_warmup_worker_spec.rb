RSpec.describe CacheWarmupWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    it 'calls Leagues warmup' do
      expect(Interactors::CacheWarmup::Leagues).to receive(:call)
      expect(Interactors::CacheWarmup::TodayMatches).to receive(:call)
      worker.perform
    end
  end
end
