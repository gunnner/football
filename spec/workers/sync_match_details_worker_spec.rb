RSpec.describe SyncMatchDetailsWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    context 'when no live matches' do
      it 'skips sync' do
        expect(Organizers::SyncMatchData).not_to receive(:call)
        worker.perform
      end

      it 'logs skipping message' do
        expect(worker).to receive(:log).with('No matches to sync — skipping')
        worker.perform
      end
    end

    context 'when live matches exist in active league' do
      let!(:league) { create(:league, external_id: ENV.fetch('ACTIVE_LEAGUE_IDS').to_i) }
      let!(:match)  { create(:match, status: 'First half', league: league) }

      it 'calls organizer for each live match' do
        result = double('result', success?: true, failure?: false)
        expect(Organizers::SyncMatchData).to receive(:call).with(match: match).and_return(result)
        worker.perform
      end

      it 'logs error when organizer fails' do
        result = double('result', success?: false, failure?: true, error: 'API error')
        allow(Organizers::SyncMatchData).to receive(:call).and_return(result)
        expect(worker).to receive(:log_error).with(/Failed/)
        worker.perform
      end
    end

    context 'when live match in non-active league' do
      let!(:other_league) { create(:league, external_id: 99999) }
      let!(:match)        { create(:match, status: 'First half', league: other_league) }

      it 'skips matches from non-active leagues' do
        expect(Organizers::SyncMatchData).not_to receive(:call)
        worker.perform
      end
    end

    context 'when rate limit reached' do
      let!(:league) { create(:league, external_id: ENV.fetch('ACTIVE_LEAGUE_IDS').to_i) }
      let!(:match)  { create(:match, status: 'First half', league: league) }

      it 'does not raise' do
        allow(Organizers::SyncMatchData).to receive(:call).and_raise(Highlightly::RateLimitError)
        expect { worker.perform }.not_to raise_error
      end
    end

    context 'when unexpected error occurs' do
      let!(:league) { create(:league, external_id: ENV.fetch('ACTIVE_LEAGUE_IDS').to_i) }
      let!(:match)  { create(:match, status: 'First half', league: league) }

      it 'captures exception and re-raises' do
        allow(Organizers::SyncMatchData).to receive(:call).and_raise(StandardError, 'unexpected')
        expect(Sentry).to receive(:capture_exception)
        expect { worker.perform }.to raise_error(StandardError)
      end
    end
  end
end
