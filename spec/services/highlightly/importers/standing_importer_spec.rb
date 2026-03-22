RSpec.describe Highlightly::Importers::StandingImporter do
  let(:importer) { described_class.new }
  let!(:country) { create(:country, code: 'FR') }
  let!(:league)  { create(:league, external_id: 133, country: country) }
  let!(:team)    { create(:team, external_id: 56950) }

  let(:standings_data) do
    {
      'groups' => [
        {
          'name'      => 'Premier League - Regular Season',
          'standings' => [
            {
              'team'     => { 'id' => 56950, 'name' => 'Aston Villa', 'logo' => nil },
              'position' => 4,
              'points'   => 63,
              'total'    => { 'games' => 28, 'wins' => 20, 'draws' => 4, 'loses' => 4, 'scoredGoals' => 28, 'receivedGoals' => 27 },
              'home'     => { 'games' => 14, 'wins' => 11, 'draws' => 2, 'loses' => 1, 'scoredGoals' => 15, 'receivedGoals' => 10 },
              'away'     => { 'games' => 14, 'wins' => 9,  'draws' => 2, 'loses' => 3, 'scoredGoals' => 13, 'receivedGoals' => 17 }
            }
          ]
        }
      ],
      'league' => { 'id' => 133, 'name' => 'Ligue 1', 'season' => 2024 }
    }
  end

  before do
    allow_any_instance_of(Highlightly::Client).to receive(:standings).and_return(standings_data)
  end

  describe '#call' do
    it 'imports standings' do
      expect do
        importer.(league_external_id: 133, season: 2024)
      end.to change(Standing, :count).by(1)
    end

    it 'sets correct position and points' do
      importer.(league_external_id: 133, season: 2024)
      standing = Standing.find_by(team: team, season: 2024)
      expect(standing.position).to eq(4)
      expect(standing.points).to   eq(63)
    end

    context 'when league not found' do
      it 'returns error' do
        result = importer.(league_external_id: 999, season: 2024)
        expect(result[:error]).to be_present
      end
    end
  end
end
