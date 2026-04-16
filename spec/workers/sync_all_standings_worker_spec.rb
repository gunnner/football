RSpec.describe SyncAllStandingsWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    before do
      allow(RedisService).to receive(:get).with('requested_attempts').and_return('0')
    end

    it 'enqueues SyncStandingsWorker for each active league' do
      FootballConfig.active_league_ids.each do |league_id|
        expect(SyncStandingsWorker).to receive(:perform_async).with(league_id, Date.today.year - 1)
      end

      worker.perform
    end

    it 'stops if rate limit threshold reached' do
      allow(RedisService).to receive(:get).with('requested_attempts').and_return(Highlightly::Client::RATE_LIMIT_THRESHOLD.to_s)

      expect(SyncStandingsWorker).not_to receive(:perform_async)
      worker.perform
    end

    context 'when error occurs' do
      it 'captures exception and re-raises' do
        allow(FootballConfig).to receive(:active_league_ids).and_raise(StandardError, 'config error')

        expect(Sentry).to receive(:capture_exception)
        expect { worker.perform }.to raise_error(StandardError)
      end
    end
  end
end
