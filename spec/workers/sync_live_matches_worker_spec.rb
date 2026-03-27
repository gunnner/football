RSpec.describe SyncLiveMatchesWorker do
  let(:worker)           { described_class.new }
  let(:client)           { instance_double(Highlightly::Client) }
  let(:active_league_id) { ENV.fetch('ACTIVE_LEAGUE_IDS').to_i }
  let!(:active_league)   { create(:league, external_id: active_league_id) }

  before do
    allow(Highlightly::Client).to receive(:new).and_return(client)
  end

  describe '#perform' do
    context 'when no matches today in active leagues' do
      it 'skips API call' do
        expect(client).not_to receive(:matches)
        worker.perform
      end
    end

    context 'when today has only a future match (>30 min away)' do
      before { create(:match, league: active_league, date: 2.hours.from_now, status: Match::NOT_STARTED) }

      it 'skips API call' do
        expect(client).not_to receive(:matches)
        worker.perform
      end
    end

    context 'when a not-started match begins within 30 minutes' do
      before do
        create(:match, league: active_league, date: 20.minutes.from_now, status: Match::NOT_STARTED)
        allow(client).to receive(:matches).and_return([])
      end

      it 'calls the API' do
        expect(client).to receive(:matches)
        worker.perform
      end
    end

    context 'when a live match exists' do
      let!(:match) do
        create(:match,
          external_id: 123,
          league:      active_league,
          date:        1.hour.ago,
          status:      'First half')
      end

      before do
        allow(client).to receive(:matches).and_return([
          {
            'id'    => 123,
            'state' => {
              'description' => 'Second half',
              'clock'       => 60,
              'score'       => { 'current' => '1 - 0', 'penalties' => nil }
            }
          }
        ])
      end

      it 'updates match status' do
        worker.perform
        expect(match.reload.status).to eq('Second half')
      end

      it 'updates match score' do
        worker.perform
        expect(match.reload.score_current).to eq('1 - 0')
      end

      it 'makes one API request per active league' do
        expect(client).to receive(:matches).exactly(FootballConfig.active_league_ids.count).times
        worker.perform
      end
    end

    context 'when rate limit reached' do
      before do
        create(:match, league: active_league, date: 10.minutes.from_now, status: Match::NOT_STARTED)
        allow(client).to receive(:matches).and_raise(Highlightly::RateLimitError)
      end

      it 'does not raise' do
        expect { worker.perform }.not_to raise_error
      end
    end

    context 'when an unexpected error occurs' do
      before do
        create(:match, league: active_league, date: 10.minutes.from_now, status: Match::NOT_STARTED)
        allow(client).to receive(:matches).and_raise(StandardError, 'boom')
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures to Sentry and re-raises' do
        expect(Sentry).to receive(:capture_exception)
        expect { worker.perform }.to raise_error(StandardError, 'boom')
      end
    end
  end
end
