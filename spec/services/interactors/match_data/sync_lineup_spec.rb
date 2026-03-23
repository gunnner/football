RSpec.describe Interactors::MatchData::SyncLineup do
  let(:match) { create(:match) }

  let(:lineup_data) do
    {
      'homeTeam' => {
        'id'            => 553,
        'name'          => 'Montpellier',
        'logo'          => nil,
        'formation'     => '4-2-3-1',
        'initialLineup' => [ [ { 'name' => 'Fofana', 'number' => 30, 'position' => 'Goalkeeper' } ] ],
        'substitutes'   => [ { 'name' => 'Raolisoa', 'number' => 27, 'position' => 'Defender' } ]
      },
      'awayTeam' => {
        'id'            => 554,
        'name'          => 'Lyon',
        'logo'          => nil,
        'formation'     => '4-3-3',
        'initialLineup' => [ [ { 'name' => 'Lopes', 'number' => 1, 'position' => 'Goalkeeper' } ] ],
        'substitutes'   => []
      }
    }
  end

  before do
    allow_any_instance_of(Highlightly::Client)
      .to receive(:lineups)
      .with(match.external_id)
      .and_return(lineup_data)
  end

  describe '#call' do
    it 'creates lineups for both teams' do
      expect { described_class.(match: match) }.to change(MatchLineup, :count).by(2)
    end

    it 'sets correct formation' do
      described_class.(match: match)
      expect(MatchLineup.find_by(team_external_id: 553).formation).to eq('4-2-3-1')
    end

    it 'succeeds' do
      result = described_class.(match: match)
      expect(result).to be_success
    end

    context 'when no lineup data' do
      before do
        allow_any_instance_of(Highlightly::Client).to receive(:lineups).and_return(nil)
      end

      it 'does not create lineups' do
        expect { described_class.(match: match) }.not_to change(MatchLineup, :count)
      end
    end
  end
end
