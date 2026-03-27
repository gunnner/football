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

    context 'query building' do
      let(:query) { 'arse' }

      it 'passes a bool/should query to elasticsearch' do
        expect(Team).to receive(:search) do |q|
          expect(q.dig(:query, :bool, :should)).to be_an(Array)
          double(records: double(to_a: []))
        end

        allow(Player).to receive(:search).and_return(double(records: double(to_a: [])))
        allow(League).to receive(:search).and_return(double(records: double(to_a: [])))
        service.call
      end

      it 'includes a multi_match clause' do
        expect(Team).to receive(:search) do |q|
          clauses = q.dig(:query, :bool, :should)
          expect(clauses.any? { it[:multi_match] }).to be true
          double(records: double(to_a: []))
        end

        allow(Player).to receive(:search).and_return(double(records: double(to_a: [])))
        allow(League).to receive(:search).and_return(double(records: double(to_a: [])))
        service.call
      end

      it 'includes a wildcard clause for prefix matching' do
        expect(Team).to receive(:search) do |q|
          clauses = q.dig(:query, :bool, :should)
          expect(clauses.any? { it[:wildcard] }).to be true
          double(records: double(to_a: []))
        end

        allow(Player).to receive(:search).and_return(double(records: double(to_a: [])))
        allow(League).to receive(:search).and_return(double(records: double(to_a: [])))
        service.call
      end

      it 'builds wildcard with lowercase query and trailing *' do
        expect(Team).to receive(:search) do |q|
          wildcard_clause = q.dig(:query, :bool, :should).find { it[:wildcard] }
          value = wildcard_clause.dig(:wildcard, :name_exact, :value)
          expect(value).to eq('arse*')
          double(records: double(to_a: []))
        end

        allow(Player).to receive(:search).and_return(double(records: double(to_a: [])))
        allow(League).to receive(:search).and_return(double(records: double(to_a: [])))
        service.call
      end

      it 'uses AUTO fuzziness' do
        expect(Team).to receive(:search) do |q|
          multi_match = q.dig(:query, :bool, :should).find { it[:multi_match] }
          expect(multi_match.dig(:multi_match, :fuzziness)).to eq('AUTO')
          double(records: double(to_a: []))
        end

        allow(Player).to receive(:search).and_return(double(records: double(to_a: [])))
        allow(League).to receive(:search).and_return(double(records: double(to_a: [])))
        service.call
      end
    end
  end
end
