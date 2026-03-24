RSpec.describe 'Api::V1::Teams', type: :request do
  let!(:team) { create(:team) }

  describe 'GET /api/v1/teams' do
    it 'returns teams' do
      get '/api/v1/teams'
      expect(response).to have_http_status(:ok)
      expect(json_response['data']).to be_an(Array)
    end
  end

  describe 'GET /api/v1/teams/:id' do
    it 'returns team' do
      get "/api/v1/teams/#{team.id}"
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for missing team' do
      get '/api/v1/teams/999999'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /api/v1/teams/:id/transfers' do
    let!(:transfer) { create(:player_transfer, team_from: team.name) }

    it 'returns transfers' do
      get "/api/v1/teams/#{team.id}/transfers"
      expect(response).to have_http_status(:ok)
    end
  end
end
