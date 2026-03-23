RSpec.describe Highlightly::Importers::HighlightImporter do
  let(:importer)   { described_class.new }
  let!(:country)   { create(:country, code: 'FR') }
  let!(:league)    { create(:league, external_id: 133, country: country) }
  let!(:home_team) { create(:team, external_id: 553) }
  let!(:away_team) { create(:team, external_id: 554) }
  let!(:match)     { create(:match, external_id: 489389, league: league, home_team: home_team, away_team: away_team) }

  let(:highlights_data) do
    [
      {
        'id'       => 1,
        'type'     => 'VERIFIED',
        'title'    => 'Ligue 1: Lyon vs Reims',
        'url'      => 'https://example.com/highlight/1',
        'embedUrl' => 'https://example.com/embed/1',
        'imgUrl'   => 'https://example.com/img/1.png',
        'source'   => 'youtube',
        'channel'  => 'Ligue 1',
        'match'    => {
          'id'       => 489389,
          'round'    => 'Regular Season - 32',
          'date'     => '2024-03-20T15:30:00.000Z',
          'country'  => { 'code' => 'FR', 'name' => 'France', 'logo' => nil },
          'homeTeam' => { 'id' => 553, 'name' => 'Montpellier', 'logo' => nil },
          'awayTeam' => { 'id' => 554, 'name' => 'Lyon', 'logo' => nil },
          'league'   => { 'id' => 133, 'name' => 'Ligue 1', 'logo' => nil, 'season' => 2024 },
          'state'    => { 'description' => 'Finished', 'clock' => nil, 'score' => { 'current' => '2 - 1', 'penalties' => nil } }
        }
      }
    ]
  end

  before do
    allow_any_instance_of(Highlightly::Client).to receive(:highlights).and_return(highlights_data)
  end

  describe '#call' do
    it 'imports highlights' do
      expect { importer.call }.to change(Highlight, :count).by(1)
    end

    it 'returns imported count' do
      result = importer.call
      expect(result[:imported]).to eq(1)
    end

    it 'upserts existing highlights' do
      create(:highlight, external_id: 1, match: match, title: 'Old Title')
      importer.call
      expect(Highlight.find_by(external_id: 1).title).to eq('Ligue 1: Lyon vs Reims')
    end

    context 'when match does not exist' do
      it 'creates match automatically' do
        match.destroy
        expect { importer.call }.to change(Match, :count).by(1)
      end
    end

    context 'when no highlights' do
      before do
        allow_any_instance_of(Highlightly::Client).to receive(:highlights).and_return([])
      end

      it 'returns zero imported' do
        result = importer.call
        expect(result[:imported]).to eq(0)
      end
    end
  end
end
