RSpec.describe SyncLiveMatchesWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    context 'when no live matches' do
      it 'skips sync' do
        expect(Organizers::SyncMatchData).not_to receive(:call)
        worker.perform
      end
    end

    context 'when live matches exist' do
      let!(:live_match) { create(:match, status: 'First half') }

      it 'calls organizer for each match' do
        result = double('result', success?: true, failure?: false)
        expect(Organizers::SyncMatchData)
          .to receive(:call)
          .with(match: live_match)
          .and_return(result)
        worker.perform
      end
    end
  end
end
