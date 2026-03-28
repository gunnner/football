RSpec.describe SyncWeeklyFixturesWorker do
  let(:worker)   { described_class.new }
  let(:importer) { instance_double(Highlightly::Importers::MatchImporter) }

  before do
    allow(Highlightly::Importers::MatchImporter).to receive(:new).and_return(importer)
    allow(importer).to receive(:call)
  end

  describe '#perform' do
    it 'imports fixtures for each of the next 7 days' do
      expected_dates = (0..6).map { Date.today + it }

      expected_dates.each do |date|
        FootballConfig.active_league_ids.each do |league_id|
          expect(importer).to receive(:call).with(date: date, league_id: league_id)
        end
      end

      worker.perform
    end

    it 'covers exactly 7 days (today through 6 days ahead)' do
      call_dates = []
      allow(importer).to receive(:call) { call_dates << it[:date] }

      worker.perform

      expect(call_dates.uniq.sort).to eq((0..6).map { Date.today + it })
    end

    it 'imports for all active leagues' do
      call_league_ids = []
      allow(importer).to receive(:call) { call_league_ids << it[:league_id] }

      worker.perform

      expect(call_league_ids.uniq.sort).to eq(FootballConfig.active_league_ids.sort)
    end

    context 'when rate limit is reached' do
      before do
        allow(importer).to receive(:call).and_raise(Highlightly::RateLimitError)
      end

      it 'does not raise' do
        expect { worker.perform }.not_to raise_error
      end
    end

    context 'when an unexpected error occurs' do
      before do
        allow(importer).to receive(:call).and_raise(StandardError, 'oops')
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures to Sentry and re-raises' do
        expect(Sentry).to receive(:capture_exception)
        expect { worker.perform }.to raise_error(StandardError, 'oops')
      end
    end
  end
end
