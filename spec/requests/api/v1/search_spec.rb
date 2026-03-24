RSpec.describe 'Api::V1::Search', type: :request do
  before do
    allow(SearchService).to receive(:new).and_return(
      double(call: { teams: [], players: [], leagues: [] })
    )
  end

  describe 'GET /api/v1/search' do
    it 'returns search results' do
      get '/api/v1/search', params: { q: 'premier' }
      expect(response).to have_http_status(:ok)
    end

    it 'returns 400 without query' do
      get '/api/v1/search'
      expect(response).to have_http_status(:bad_request)
    end

    it 'filters by type' do
      get '/api/v1/search', params: { q: 'premier', type: 'league' }
      expect(response).to have_http_status(:ok)
    end
  end
end
