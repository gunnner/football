RSpec.describe MatchBroadcastService do
  let!(:league)    { create(:league) }
  let!(:home_team) { create(:team) }
  let!(:away_team) { create(:team) }
  let!(:match) do
    create(:match,
      league:        league,
      home_team:     home_team,
      away_team:     away_team,
      status:        'First half',
      score_current: '1 - 0'
    )
  end

  describe '.broadcast_update' do
    it 'broadcasts to match channel' do
      expect(ActionCable.server).to receive(:broadcast).with(
        "match_#{match.id}",
        hash_including(type: 'match_update')
      )
      described_class.broadcast_update(match)
    end
  end

  describe '.broadcast_goal' do
    let!(:event) { create(:match_event, match: match, event_type: 'Goal') }

    it 'broadcasts goal event' do
      expect(ActionCable.server).to receive(:broadcast).with(
        "match_#{match.id}",
        hash_including(type: 'goal')
      )
      described_class.broadcast_goal(match, event)
    end
  end

  describe '.broadcast_match_start' do
    it 'broadcasts match start' do
      expect(ActionCable.server).to receive(:broadcast).with(
        "match_#{match.id}",
        hash_including(type: 'match_start')
      )
      described_class.broadcast_match_start(match)
    end
  end

  describe '.broadcast_match_end' do
    it 'broadcasts match end' do
      expect(ActionCable.server).to receive(:broadcast).with(
        "match_#{match.id}",
        hash_including(type: 'match_end')
      )
      described_class.broadcast_match_end(match)
    end
  end
end
