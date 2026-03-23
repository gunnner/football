RSpec.describe ElasticsearchIndexWorker do
  let(:worker) { described_class.new }

  describe '#perform' do
    context 'when action is index' do
      let!(:team) { create(:team) }

      it 'indexes document' do
        expect_any_instance_of(Team).to receive_message_chain(:__elasticsearch__, :index_document)
        worker.perform('Team', team.id)
      end

      it 'skips if record not found' do
        expect_any_instance_of(Team).not_to receive(:__elasticsearch__)
        worker.perform('Team', 999999)
      end
    end

    context 'when action is delete' do
      let!(:team) { create(:team) }

      it 'deletes document from index' do
        client = double('client')
        allow(Team.__elasticsearch__).to receive(:client).and_return(client)
        expect(client).to receive(:delete).with(
          index: Team.index_name,
          id:    team.id
        )
        worker.perform('Team', team.id, 'delete')
      end
    end
  end
end
