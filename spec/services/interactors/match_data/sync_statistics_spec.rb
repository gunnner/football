RSpec.describe Interactors::MatchData::SyncStatistics do
  let(:match) { create(:match) }

  let(:statistics_data) do
    [
      {
        'team'       => { 'id' => 553, 'name' => 'Montpellier', 'logo' => nil },
        'statistics' => [
          { 'displayName' => 'Ball possession', 'value' => 65.5 },
          { 'displayName' => 'Shots accuracy',  'value' => 0.62 }
        ]
      }
    ]
  end

  before do
    allow_any_instance_of(Highlightly::Client)
      .to receive(:statistics)
      .with(match.external_id)
      .and_return(statistics_data)
  end

  describe '#call' do
    it 'creates match statistics' do
      expect { described_class.(match: match) }.to change(MatchStatistic, :count).by(2)
    end

    it 'succeeds' do
      result = described_class.(match: match)
      expect(result).to be_success
    end

    context 'when no statistics' do
      before do
        allow_any_instance_of(Highlightly::Client)
          .to receive(:statistics)
          .and_return([])
      end

      it 'does not create statistics' do
        expect { described_class.(match: match) }.not_to change(MatchStatistic, :count)
      end
    end
  end
end
