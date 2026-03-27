RSpec.describe Highlightly::Importers::PlayerImporter do
  let(:importer) { described_class.new }

  let(:box_score_data) do
    [
      {
        'team'    => { 'id' => 553, 'name' => 'Arsenal' },
        'players' => [
          {
            'id'       => 1001,
            'name'     => 'Saka',
            'fullName' => 'Bukayo Saka',
            'logo'     => 'https://example.com/saka.png'
          },
          {
            'id'       => 1002,
            'name'     => 'Odegaard',
            'fullName' => 'Martin Odegaard',
            'logo'     => nil
          }
        ]
      },
      {
        'team'    => { 'id' => 554, 'name' => 'Chelsea' },
        'players' => [
          {
            'id'       => 2001,
            'name'     => 'Palmer',
            'fullName' => 'Cole Palmer',
            'logo'     => 'https://example.com/palmer.png'
          }
        ]
      }
    ]
  end

  describe '#call' do
    context 'when box_score_data is blank' do
      it 'returns zero imported count' do
        result = importer.call(box_score_data: [])
        expect(result).to eq({ imported: 0 })
      end

      it 'does not create players' do
        expect { importer.call(box_score_data: []) }.not_to change(Player, :count)
      end

      it 'returns zero for nil data' do
        result = importer.call(box_score_data: nil)
        expect(result).to eq({ imported: 0 })
      end
    end

    context 'with valid player data' do
      it 'creates new players' do
        expect { importer.call(box_score_data: box_score_data) }
          .to change(Player, :count).by(3)
      end

      it 'returns imported count' do
        result = importer.call(box_score_data: box_score_data)
        expect(result[:imported]).to eq(3)
      end

      it 'persists correct fields' do
        importer.call(box_score_data: box_score_data)
        player = Player.find_by(external_id: 1001)
        expect(player.name).to      eq('Saka')
        expect(player.full_name).to eq('Bukayo Saka')
        expect(player.logo).to      eq('https://example.com/saka.png')
      end

      it 'strips whitespace from name and full_name' do
        data = [ { 'players' => [ { 'id' => 9999, 'name' => '  Saka  ', 'fullName' => '  Bukayo Saka  ' } ] } ]
        importer.call(box_score_data: data)
        player = Player.find_by(external_id: 9999)
        expect(player.name).to      eq('Saka')
        expect(player.full_name).to eq('Bukayo Saka')
      end

      it 'upserts existing players updating only name, full_name, logo' do
        existing = create(:player, external_id: 1001, name: 'Old Name')
        importer.call(box_score_data: box_score_data)
        expect(existing.reload.name).to eq('Saka')
      end

      it 'deduplicates players with same external_id' do
        duplicate_data = [
          { 'players' => [ { 'id' => 1001, 'name' => 'Saka', 'fullName' => 'Bukayo Saka' } ] },
          { 'players' => [ { 'id' => 1001, 'name' => 'Saka', 'fullName' => 'Bukayo Saka' } ] }
        ]
        expect { importer.call(box_score_data: duplicate_data) }.to change(Player, :count).by(1)
      end

      it 'skips players without id' do
        data = [ { 'players' => [ { 'id' => nil, 'name' => 'Ghost' } ] } ]
        expect { importer.call(box_score_data: data) }.not_to change(Player, :count)
      end

      it 'skips teams with no players key' do
        data = [ { 'team' => { 'id' => 553 } } ]
        expect { importer.call(box_score_data: data) }.not_to change(Player, :count)
      end
    end

    context 'linking box_scores to players' do
      let!(:match) { create(:match) }

      it 'links existing box_scores that have no player_id' do
        box_score = create(:box_score, match: match, player_external_id: 1001, player_id: nil)
        importer.call(box_score_data: box_score_data)
        expect(box_score.reload.player).to eq(Player.find_by(external_id: 1001))
      end

      it 'does not overwrite existing player_id' do
        existing_player = create(:player, external_id: 1001)
        box_score = create(:box_score, match: match, player_external_id: 1001, player: existing_player)
        expect { importer.call(box_score_data: box_score_data) }
          .not_to change { box_score.reload.player_id }
      end

      it 'does not link when player does not exist in db' do
        box_score = create(:box_score, match: match, player_external_id: 9999, player_id: nil)
        importer.call(box_score_data: box_score_data)
        expect(box_score.reload.player_id).to be_nil
      end
    end

    context 'when an error occurs' do
      before do
        allow(Player).to receive(:upsert_all).and_raise(StandardError, 'DB error')
        allow(Sentry).to receive(:capture_exception)
      end

      it 'returns error hash' do
        result = importer.call(box_score_data: box_score_data)
        expect(result).to eq({ imported: 0, error: 'DB error' })
      end

      it 'captures exception with Sentry' do
        importer.call(box_score_data: box_score_data)
        expect(Sentry).to have_received(:capture_exception)
      end
    end
  end
end
