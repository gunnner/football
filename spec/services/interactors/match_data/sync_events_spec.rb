RSpec.describe Interactors::MatchData::SyncEvents do
  let(:match) { create(:match) }

  let(:events_data) do
    [
      {
        'time'              => '45',
        'type'              => 'Goal',
        'team'              => { 'id' => 553, 'name' => 'Montpellier', 'logo' => nil },
        'playerId'          => 1234,
        'player'            => 'M. Mamdouh',
        'assistingPlayerId' => 0,
        'assist'            => nil,
        'substituted'       => nil
      }
    ]
  end

  before do
    allow_any_instance_of(Highlightly::Client)
      .to receive(:events)
      .with(match.external_id)
      .and_return(events_data)
  end

  describe '#call' do
    it 'creates match events' do
      expect { described_class.(match: match) }.to change(MatchEvent, :count).by(1)
    end

    it 'succeeds' do
      result = described_class.(match: match)
      expect(result).to be_success
    end

    context 'when no events' do
      before do
        allow_any_instance_of(Highlightly::Client)
          .to receive(:events)
          .and_return([])
      end

      it 'does not create events' do
        expect { described_class.(match: match) }.not_to change(MatchEvent, :count)
      end
    end
  end
end
