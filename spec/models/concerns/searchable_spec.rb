RSpec.describe Searchable do
  let(:team) { create(:team) }

  describe 'after_commit callbacks' do
    it 'enqueues index job on create' do
      expect(ElasticsearchIndexWorker).to receive(:perform_async).with('Team', anything)
      create(:team)
    end

    it 'enqueues index job on update' do
      expect(ElasticsearchIndexWorker).to receive(:perform_async).with('Team', team.id)
      team.update!(name: 'New Name')
    end

    it 'enqueues delete job on destroy' do
      expect(ElasticsearchIndexWorker).to receive(:perform_async).with('Team', team.id, 'delete')
      team.destroy
    end
  end
end
