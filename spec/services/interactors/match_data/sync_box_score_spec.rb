RSpec.describe Interactors::MatchData::SyncBoxScore do
  let(:match) { create(:match) }

  let(:box_score_data) do
    [
      {
        'team' => { 'id' => 553, 'name' => 'Arsenal', 'logo' => nil },
        'players' => [
          {
            'id'            => 1001,
            'name'          => 'Saka',
            'fullName'      => 'Bukayo Saka',
            'logo'          => 'https://example.com/saka.png',
            'shirtNumber'   => 7,
            'position'      => 'Right Winger',
            'isCaptain'     => false,
            'isSubstitute'  => false,
            'minutesPlayed' => 90,
            'matchRating'   => '8.20',
            'offsides'      => 0,
            'statistics'    => {
              'goalsScored'      => 1,
              'assists'          => 1,
              'shotsOnTarget'    => 3,
              'shotsOffTarget'   => 1,
              'shotsTotal'       => 4,
              'passesTotal'      => 42,
              'passesSuccessful' => 38,
              'passesFailed'     => 4,
              'passesAccuracy'   => '90.48 %',
              'tacklesTotal'     => 2
            }
          }
        ]
      }
    ]
  end

  before do
    allow_any_instance_of(Highlightly::Client).to receive(:box_score).with(match.external_id).and_return(box_score_data)
    allow_any_instance_of(Highlightly::Importers::PlayerImporter).to receive(:call).and_return({ imported: 1 })
  end

  describe '#call' do
    it 'succeeds' do
      result = described_class.(match: match)
      expect(result).to be_success
    end

    it 'creates box score records' do
      expect { described_class.(match: match) }.to change(BoxScore, :count).by(1)
    end

    it 'persists player and team fields correctly' do
      described_class.(match: match)
      record = BoxScore.last
      expect(record.player_external_id).to eq(1001)
      expect(record.player_name).to        eq('Saka')
      expect(record.team_external_id).to   eq(553)
      expect(record.team_name).to          eq('Arsenal')
      expect(record.match_id).to           eq(match.id)
    end

    it 'persists statistics fields correctly' do
      described_class.(match: match)
      record = BoxScore.last
      expect(record.goals_scored).to    eq(1)
      expect(record.assists).to         eq(1)
      expect(record.shots_on_target).to eq(3)
      expect(record.passes_total).to    eq(42)
      expect(record.tackles_total).to   eq(2)
    end

    it 'delegates player import to PlayerImporter' do
      expect_any_instance_of(Highlightly::Importers::PlayerImporter).to receive(:call).with(box_score_data: box_score_data)
      described_class.(match: match)
    end

    it 'upserts on re-run without duplicating records' do
      described_class.(match: match)
      expect { described_class.(match: match) }.not_to change(BoxScore, :count)
    end

    context 'when box_score_data is empty' do
      before do
        allow_any_instance_of(Highlightly::Client).to receive(:box_score).and_return([])
      end

      it 'does not create box scores' do
        expect { described_class.(match: match) }.not_to change(BoxScore, :count)
      end

      it 'succeeds' do
        result = described_class.(match: match)
        expect(result).to be_success
      end
    end

    context 'when match context is missing' do
      it 'fails with validation error' do
        result = described_class.call(match: nil)
        expect(result).to be_failure
      end
    end

    context 'when an error occurs' do
      before do
        allow(BoxScore).to receive(:upsert_all).and_raise(StandardError, 'DB error')
      end

      it 'fails the context' do
        result = described_class.(match: match)
        expect(result).to be_failure
      end
    end
  end
end
