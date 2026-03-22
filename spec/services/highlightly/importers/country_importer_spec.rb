RSpec.describe Highlightly::Importers::CountryImporter do
  let(:importer) { described_class.new }

  let(:countries_data) do
    [
      { 'code' => 'FR', 'name' => 'France',  'logo' => 'https://example.com/fr.svg' },
      { 'code' => 'DE', 'name' => 'Germany', 'logo' => 'https://example.com/de.svg' }
    ]
  end

  before do
    allow_any_instance_of(Highlightly::Client).to receive(:countries).and_return(countries_data)
  end

  describe '#call' do
    it 'imports countries' do
      expect { importer.call }.to change(Country, :count).by(2)
    end

    it 'returns imported count' do
      result = importer.call
      expect(result[:imported]).to eq(2)
    end

    it 'upserts existing countries' do
      create(:country, code: 'FR', name: 'Old Name')
      importer.call
      expect(Country.find_by(code: 'FR').name).to eq('France')
    end

    it 'upcases country code' do
      allow_any_instance_of(Highlightly::Client)
        .to receive(:countries)
        .and_return([ { 'code' => 'fr', 'name' => 'France', 'logo' => nil } ])

      importer.call
      expect(Country.find_by(code: 'FR')).to be_present
    end
  end
end
