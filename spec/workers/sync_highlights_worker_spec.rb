RSpec.describe SyncHighlightsWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    it 'calls HighlightImporter with today date' do
      expect_any_instance_of(Highlightly::Importers::HighlightImporter)
        .to receive(:call)
        .with(date: Date.today)
      worker.perform
    end

    it 'calls HighlightImporter with given date' do
      expect_any_instance_of(Highlightly::Importers::HighlightImporter)
        .to receive(:call)
        .with(date: Date.parse('2024-03-20'))
      worker.perform('2024-03-20')
    end

    context 'when rate limit reached' do
      it 'does not raise' do
        allow_any_instance_of(Highlightly::Importers::HighlightImporter)
          .to receive(:call)
          .and_raise(Highlightly::RateLimitError)

        expect { worker.perform }.not_to raise_error
      end
    end
  end
end
