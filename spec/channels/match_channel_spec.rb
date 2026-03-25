RSpec.describe MatchChannel, type: :channel do
  let!(:user)  { create(:user) }
  let!(:match) { create(:match) }

  before do
    stub_connection current_user: user
  end

  describe '#subscribed' do
    it 'subscribes to match stream' do
      subscribe(match_id: match.id)
      expect(subscription).to be_confirmed
      expect(subscription).to have_stream_from("match_#{match.id}")
    end

    it 'rejects subscription for missing match' do
      subscribe(match_id: 999999)
      expect(subscription).to be_rejected
    end
  end

  describe '#unsubscribed' do
    it 'stops all streams' do
      subscribe(match_id: match.id)
      expect { unsubscribe }.not_to raise_error
    end
  end
end
