RSpec.describe Highlightly::Importers::LeagueImporter do
  let(:importer) { described_class.new }
  let!(:france)  { create(:country, code: 'FR', name: 'France') }

  let(:leagues_data) do
    [
      {
        'id'      => 133,
        'name'    => 'Ligue 1',
        'logo'    => 'https://example.com/ligue1.png',
        'country' => { 'code' => 'FR', 'name' => 'France', 'logo' => nil },
        'seasons' => [ { 'season' => 2023 }, { 'season' => 2024 } ]
      }
    ]
  end

  before do
    allow_any_instance_of(Highlightly::Client).to receive(:leagues).and_return(leagues_data)
  end

  describe '#call' do
    it 'imports leagues' do
      expect { importer.call }.to change(League, :count).by(1)
    end

    it 'sets correct seasons' do
      importer.call
      expect(League.find_by(external_id: 133).seasons).to eq([ 2023, 2024 ])
    end

    it 'skips league if country not found' do
      allow_any_instance_of(Highlightly::Client)
        .to receive(:leagues)
        .and_return(Array.wrap(leagues_data.first.merge('country' => { 'code' => 'XX' })))

      expect { importer.call }.not_to change(League, :count)
    end

    it 'upserts existing leagues' do
      create(:league, external_id: 133, name: 'Old Name', country: france)
      importer.call
      expect(League.find_by(external_id: 133).name).to eq('Ligue 1')
    end
  end
end
