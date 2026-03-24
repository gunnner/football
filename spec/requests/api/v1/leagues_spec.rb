RSpec.describe 'Api::V1::Leagues', type: :request do
  let!(:country) { create(:country) }
  let!(:league)  { create(:league, country: country) }

  describe 'GET /api/v1/leagues' do
    it 'returns leagues' do
      get '/api/v1/leagues'
      expect(response).to have_http_status(:ok)
      expect(json_response['data']).to be_an(Array)
    end

    it 'filters by country_code' do
      get '/api/v1/leagues', params: { country_code: country.code }
      expect(response).to have_http_status(:ok)
    end

    it 'paginates results' do
      get '/api/v1/leagues', params: { per_page: 1 }
      expect(json_response['meta']['per_page']).to eq(1)
    end
  end

  describe 'GET /api/v1/leagues/:id' do
    it 'returns league' do
      get "/api/v1/leagues/#{league.id}"
      expect(response).to have_http_status(:ok)
      expect(json_response['data']['id']).to eq(league.id.to_s)
    end

    it 'returns 404 for missing league' do
      get '/api/v1/leagues/999999'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /api/v1/leagues/:id/standings' do
    let!(:team)     { create(:team) }
    let!(:standing) { create(:standing, league: league, team: team, season: 2024) }

    it 'returns standings' do
      get "/api/v1/leagues/#{league.id}/standings", params: { season: 2024 }
      expect(response).to have_http_status(:ok)
    end
  end
end
