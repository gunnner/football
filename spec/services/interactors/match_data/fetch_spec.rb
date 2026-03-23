RSpec.describe Interactors::MatchData::Fetch do
  let(:match) { create(:match) }

  let(:match_data) do
    [ {
      'id'    => match.external_id,
      'state' => {
        'description' => 'First half',
        'clock'       => 35,
        'score'       => { 'current' => '1 - 0', 'penalties' => nil }
      }
    } ]
  end

  before do
    allow_any_instance_of(Highlightly::Client)
      .to receive(:match)
      .with(match.external_id)
      .and_return(match_data)
  end

  describe '#call' do
    it 'sets match_data in context' do
      result = described_class.(match: match)
      expect(result.match_data).to be_present
    end

    it 'succeeds' do
      result = described_class.(match: match)
      expect(result).to be_success
    end

    context 'when API returns empty data' do
      before do
        allow_any_instance_of(Highlightly::Client)
          .to receive(:match)
          .and_return([])
      end

      it 'fails context' do
        result = described_class.(match: match)
        expect(result).to be_failure
      end
    end

    context 'when API raises error' do
      before do
        allow_any_instance_of(Highlightly::Client)
          .to receive(:match)
          .and_raise(Highlightly::RateLimitError)
      end

      it 'fails context' do
        result = described_class.(match: match)
        expect(result).to be_failure
      end
    end
  end
end
