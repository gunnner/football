RSpec.describe Highlightly::Importers::MatchImporter do
  let(:importer) { described_class.new }
  let!(:country) { create(:country, code: 'FR', name: 'France') }
  let!(:league)  { create(:league, external_id: 133, country: country) }

  let(:matches_data) do
    [
      {
        'id'       => 489389,
        'round'    => 'Regular Season - 32',
        'date'     => '2024-03-20T15:30:00.000Z',
        'country'  => { 'code' => 'FR', 'name' => 'France', 'logo' => nil },
        'homeTeam' => { 'id' => 553, 'name' => 'Montpellier', 'logo' => nil },
        'awayTeam' => { 'id' => 554, 'name' => 'Lyon', 'logo' => nil },
        'league'   => { 'id' => 133, 'name' => 'Ligue 1', 'logo' => nil, 'season' => 2024 },
        'state'    => {
          'description' => 'Not started',
          'clock'       => nil,
          'score'       => { 'current' => nil, 'penalties' => nil }
        }
      }
    ]
  end

  before do
    allow_any_instance_of(Highlightly::Client).to receive(:matches).and_return(matches_data)
  end

  describe '#call' do
    it 'imports matches' do
      expect { importer.call }.to change(Match, :count).by(1)
    end

    it 'creates teams automatically' do
      expect { importer.call }.to change(Team, :count).by(2)
    end

    it 'upserts existing matches' do
      home_team = create(:team, external_id: 553)
      away_team = create(:team, external_id: 554)

      create(:match,
        external_id: 489389,
        league:      league,
        home_team:   home_team,
        away_team:   away_team,
        status:      'Not started'
      )

      allow_any_instance_of(Highlightly::Client)
        .to receive(:matches)
        .and_return([ matches_data.first.merge(
          'state' => matches_data.first['state'].merge('description' => 'Finished')
        ) ])

      importer.call
      expect(Match.find_by(external_id: 489389).status).to eq('Finished')
    end
  end
end
