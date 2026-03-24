RSpec.describe SyncMatchesWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    it 'calls MatchImporter with today date' do
      expect_any_instance_of(Highlightly::Importers::MatchImporter)
        .to receive(:call)
        .with(date: Date.today, league_id: ENV.fetch('ACTIVE_LEAGUE_IDS').to_i)
      worker.perform
    end

    it 'calls MatchImporter with given date' do
      expect_any_instance_of(Highlightly::Importers::MatchImporter)
        .to receive(:call)
        .with(date: Date.parse('2024-03-20'), league_id: ENV.fetch('ACTIVE_LEAGUE_IDS').to_i)
      worker.perform('2024-03-20')
    end

    context 'when rate limit reached' do
      it 'does not raise' do
        allow_any_instance_of(Highlightly::Importers::MatchImporter)
          .to receive(:call)
          .and_raise(Highlightly::RateLimitError)
        expect { worker.perform }.not_to raise_error
      end
    end
  end
end
