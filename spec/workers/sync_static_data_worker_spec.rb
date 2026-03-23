RSpec.describe SyncStaticDataWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    it 'calls CountryImporter' do
      expect_any_instance_of(Highlightly::Importers::CountryImporter).to receive(:call)
      expect_any_instance_of(Highlightly::Importers::LeagueImporter).to receive(:call)
      worker.perform
    end

    context 'when rate limit reached' do
      it 'does not raise' do
        allow_any_instance_of(Highlightly::Importers::CountryImporter)
          .to receive(:call)
          .and_raise(Highlightly::RateLimitError)

        expect { worker.perform }.not_to raise_error
      end
    end
  end
end
