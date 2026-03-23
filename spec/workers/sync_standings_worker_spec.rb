RSpec.describe SyncStandingsWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    it 'calls StandingImporter with correct params' do
      expect_any_instance_of(Highlightly::Importers::StandingImporter)
        .to receive(:call)
        .with(league_external_id: 133, season: 2024)
      worker.perform(133, 2024)
    end

    context 'when rate limit reached' do
      it 'does not raise' do
        allow_any_instance_of(Highlightly::Importers::StandingImporter)
          .to receive(:call)
          .and_raise(Highlightly::RateLimitError)

        expect { worker.perform(133, 2024) }.not_to raise_error
      end
    end
  end
end
