RSpec.describe SearchService do
  let(:service) { described_class.new(query) }

  before do
    allow(Team).to   receive(:search).and_return(double(records: double(to_a: [])))
    allow(Player).to receive(:search).and_return(double(records: double(to_a: [])))
    allow(League).to receive(:search).and_return(double(records: double(to_a: [])))
  end

  describe '#call' do
    context 'when query is blank' do
      let(:query) { '' }

      it 'returns empty results without searching' do
        expect(Team).not_to receive(:search)
        result = service.call
        expect(result).to eq({ teams: [], players: [], leagues: [] })
      end
    end

    context 'when query is present' do
      let(:query) { 'manchester' }

      it 'searches all models' do
        expect(Team).to   receive(:search)
        expect(Player).to receive(:search)
        expect(League).to receive(:search)
        service.call
      end

      it 'returns hash with all keys' do
        result = service.call
        expect(result.keys).to contain_exactly(:teams, :players, :leagues)
      end
    end

    context 'when elasticsearch raises error' do
      let(:query) { 'manchester' }

      it 'returns empty array for failed model' do
        allow(Team).to receive(:search).and_raise(StandardError)
        result = service.call
        expect(result[:teams]).to eq([])
      end
    end
  end
end
