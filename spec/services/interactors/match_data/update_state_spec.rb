RSpec.describe Interactors::MatchData::UpdateState do
  let(:match) { create(:match, status: 'Not started') }

  let(:match_data) do
    {
      'state' => {
        'description' => 'First half',
        'clock'       => 35,
        'score'       => { 'current' => '1 - 0', 'penalties' => nil }
      }
    }
  end

  describe '#call' do
    it 'updates match status' do
      described_class.(match: match, match_data: match_data)
      expect(match.reload.status).to eq('First half')
    end

    it 'updates match clock' do
      described_class.(match: match, match_data: match_data)
      expect(match.reload.clock).to eq(35)
    end

    it 'updates match score' do
      described_class.(match: match, match_data: match_data)
      expect(match.reload.score_current).to eq('1 - 0')
    end

    it 'succeeds' do
      result = described_class.(match: match, match_data: match_data)
      expect(result).to be_success
    end
  end
end
