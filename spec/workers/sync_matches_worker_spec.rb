RSpec.describe SyncMatchesWorker do
  let(:worker)      { described_class.new }
  let(:league_id)   { ENV.fetch('ACTIVE_LEAGUE_IDS').to_i }
  let(:importer)    { instance_double(Highlightly::Importers::MatchImporter) }

  before do
    allow(Highlightly::Importers::MatchImporter).to receive(:new).and_return(importer)
    allow(importer).to receive(:call)
  end

  describe '#perform' do
    it 'calls MatchImporter with today and yesterday dates' do
      worker.perform
      expect(importer).to have_received(:call).with(date: Date.today.to_s, league_id: league_id)
      expect(importer).to have_received(:call).with(date: Date.yesterday.to_s, league_id: league_id)
    end

    it 'calls MatchImporter with given date and yesterday' do
      worker.perform('2024-03-20')
      expect(importer).to have_received(:call).with(date: '2024-03-20', league_id: league_id)
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
