RSpec.describe Highlightly::Importers::LeagueImporter do
  let(:importer)         { described_class.new }
  let(:active_league_id) { ENV.fetch('ACTIVE_LEAGUE_IDS').to_i }
  let!(:england)         { create(:country, code: 'GB-ENG', name: 'England') }

  let(:league_data) do
    {
      'id'      => active_league_id,
      'name'    => 'Premier League',
      'logo'    => 'https://example.com/pl.png',
      'country' => { 'code' => 'GB-ENG', 'name' => 'England', 'logo' => nil },
      'seasons' => [ { 'season' => 2024 }, { 'season' => 2023 } ]
    }
  end

  before do
    allow_any_instance_of(Highlightly::Client)
      .to receive(:leagues)
      .with(leagueId: active_league_id)
      .and_return([ league_data ])
  end

  describe '#call' do
    it 'fetches only active leagues by ID (no global pagination)' do
      expect_any_instance_of(Highlightly::Client)
        .to receive(:leagues)
        .with(leagueId: active_league_id)
        .and_return([ league_data ])

      importer.call
    end

    it 'does not call the leagues endpoint with pagination params' do
      expect_any_instance_of(Highlightly::Client)
        .not_to receive(:leagues)
        .with(hash_including(:limit, :offset))

      importer.call
    end

    it 'imports the active league' do
      expect { importer.call }.to change(League, :count).by(1)
    end

    it 'sets the correct name' do
      importer.call
      expect(League.find_by(external_id: active_league_id).name).to eq('Premier League')
    end

    it 'sets the correct seasons' do
      importer.call
      expect(League.find_by(external_id: active_league_id).seasons).to eq([ 2024, 2023 ])
    end

    it 'upserts an existing league' do
      create(:league, external_id: active_league_id, name: 'Old Name', country: england)
      importer.call
      expect(League.find_by(external_id: active_league_id).name).to eq('Premier League')
    end

    it 'skips league when country is not found in DB' do
      allow_any_instance_of(Highlightly::Client)
        .to receive(:leagues)
        .with(leagueId: active_league_id)
        .and_return([ league_data.merge('country' => { 'code' => 'XX' }) ])

      expect { importer.call }.not_to change(League, :count)
    end

    context 'when multiple active leagues are configured' do
      let(:second_id) { 99_999 }

      before do
        allow(FootballConfig).to receive(:active_league_ids).and_return([ active_league_id, second_id ])
        allow_any_instance_of(Highlightly::Client)
          .to receive(:leagues)
          .with(leagueId: second_id)
          .and_return([])
      end

      it 'fetches each active league separately' do
        expect_any_instance_of(Highlightly::Client).to receive(:leagues).with(leagueId: active_league_id).and_return([ league_data ])
        expect_any_instance_of(Highlightly::Client).to receive(:leagues).with(leagueId: second_id).and_return([])
        importer.call
      end
    end

    context 'when API returns nil' do
      before do
        allow_any_instance_of(Highlightly::Client)
          .to receive(:leagues)
          .with(leagueId: active_league_id)
          .and_return(nil)
      end

      it 'does not raise' do
        expect { importer.call }.not_to raise_error
      end

      it 'imports nothing' do
        expect { importer.call }.not_to change(League, :count)
      end
    end
  end
end
