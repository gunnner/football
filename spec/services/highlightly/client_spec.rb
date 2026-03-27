RSpec.describe Highlightly::Client do
  before do
    allow(RedisService).to receive(:get).with('requested_attempts').and_return('0')
    allow(RedisService).to receive(:set)
  end

  let(:client) { described_class.new }

  describe '#countries', vcr: { cassette_name: 'highlightly_client/countries' } do
    it 'returns array of countries' do
      result = client.countries
      expect(result).to be_an(Array)
      expect(result.first).to include('code', 'name', 'logo')
    end
  end

  describe '#leagues', vcr: { cassette_name: 'highlightly_client/leagues' } do
    it 'returns array of leagues' do
      result = client.leagues(limit: 5)
      expect(result).to be_an(Array)
      expect(result.first).to include('id', 'name', 'country', 'seasons')
    end
  end

  describe '#matches', vcr: { cassette_name: 'highlightly_client/matches' } do
    it 'returns array of matches' do
      result = client.matches(date: '2024-03-20', limit: 5)
      expect(result).to be_an(Array)
    end
  end

  describe 'rate limiting' do
    before do
      allow(RedisService).to receive(:get).with('requested_attempts').and_return('96')
    end

    it 'raises RateLimitError when threshold reached' do
      expect { client.countries }.to raise_error(Highlightly::RateLimitError)
    end
  end

  describe 'error handling' do
    it 'raises UnauthorizedError on 401' do
      stub_request(:get, /highlightly/).to_return(status: 401, body: '{}')
      expect { client.countries }.to raise_error(Highlightly::UnauthorizedError)
    end

    it 'raises NotFoundError on 404' do
      stub_request(:get, /highlightly/).to_return(status: 404, body: '{}')
      expect { client.countries }.to raise_error(Highlightly::NotFoundError)
    end

    it 'raises RateLimitError on 429' do
      stub_request(:get, /highlightly/).to_return(status: 429, body: '{}')
      expect { client.countries }.to raise_error(Highlightly::RateLimitError)
    end

    it 'raises ServerError on 500' do
      stub_request(:get, /highlightly/).to_return(status: 500, body: '{}')
      expect { client.countries }.to raise_error(Highlightly::ServerError)
    end
  end
end
