RSpec.describe SyncLiveMatchesWorker do
  let(:worker) { described_class.new }
  let(:client) { instance_double(Highlightly::Client) }

  before do
    allow(Highlightly::Client).to receive(:new).and_return(client)
  end

  describe '#perform' do
    context 'when no live matches' do
      before do
        allow(client).to receive(:matches).and_return([
          {
            'id'     => 1,
            'state'  => { 'description' => 'Not started', 'clock' => nil, 'score' => { 'current' => nil, 'penalties' => nil } },
            'league' => { 'id' => ENV.fetch('ACTIVE_LEAGUE_IDS').to_i }
          }
        ])
      end

      it 'skips sync' do
        expect(Match).not_to receive(:find_by)
        worker.perform
      end
    end

    context 'when live matches exist' do
      let!(:match) { create(:match, external_id: 123, status: 'Not started') }

      before do
        allow(client).to receive(:matches).and_return([
          {
            'id'     => 123,
            'state'  => {
              'description' => 'First half',
              'clock'       => 35,
              'score'       => { 'current' => '1 - 0', 'penalties' => nil }
            },
            'league' => { 'id' => ENV.fetch('ACTIVE_LEAGUE_IDS').to_i }
          }
        ])
      end

      it 'updates match status' do
        worker.perform
        expect(match.reload.status).to eq('First half')
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
        allow(client).to receive(:matches).and_raise(Highlightly::RateLimitError)
      end

      it 'does not raise' do
        expect { worker.perform }.not_to raise_error
      end
    end
  end
end
