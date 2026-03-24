RSpec.describe 'Api::V1::Players', type: :request do
  let!(:player) { create(:player) }

  describe 'GET /api/v1/players' do
    it 'returns players' do
      get '/api/v1/players'
      expect(response).to have_http_status(:ok)
    end

    it 'searches by name' do
      get '/api/v1/players', params: { name: player.name }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v1/players/:id' do
    it 'returns player' do
      get "/api/v1/players/#{player.id}"
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for missing player' do
      get '/api/v1/players/999999'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /api/v1/players/:id/statistics' do
    let!(:stat) { create(:player_statistic, player: player) }

    it 'returns statistics' do
      get "/api/v1/players/#{player.id}/statistics"
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v1/players/:id/transfers' do
    let!(:transfer) { create(:player_transfer, player: player) }

    it 'returns transfers' do
      get "/api/v1/players/#{player.id}/transfers"
      expect(response).to have_http_status(:ok)
    end
  end
end
