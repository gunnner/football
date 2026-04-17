RSpec.describe SyncHighlightsWorker do
  let(:worker)   { described_class.new }
  let(:importer) { instance_double(Highlightly::Importers::HighlightImporter) }

  before do
    allow(Highlightly::Importers::HighlightImporter).to receive(:new).and_return(importer)
    allow(importer).to receive(:call)
  end

  describe '#perform' do
    it 'calls HighlightImporter with today date' do
      worker.perform
      expect(importer).to have_received(:call).with(hash_including(date: Date.today.to_s))
    end

    it 'calls HighlightImporter with given date' do
      worker.perform('2024-03-20')
      expect(importer).to have_received(:call).with(hash_including(date: '2024-03-20'))
    end

    it 'passes league params to importer' do
      worker.perform
      expect(importer).to have_received(:call).with(
        hash_including(leagueId: FootballConfig::ACTIVE_LEAGUES.first[:external_id])
      )
    end

    context 'when rate limit reached' do
      it 'does not raise' do
        allow(importer).to receive(:call).and_raise(Highlightly::RateLimitError)
        expect { worker.perform }.not_to raise_error
      end
    end
  end
end
