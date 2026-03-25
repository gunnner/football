RSpec.describe 'Api::V1::Favorites', type: :request do
  let!(:user)   { create(:user) }
  let!(:league) { create(:league) }
  let!(:team)   { create(:team) }
  let!(:player) { create(:player) }

  describe 'GET /api/v1/favorites' do
    let!(:favorite) { create(:favorite, user: user, favoritable: league) }

    it 'returns all favorites' do
      get '/api/v1/favorites', headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(json_response['data']).to include('leagues', 'teams', 'players')
    end
  end

  describe 'GET /api/v1/favorites/leagues' do
    let!(:favorite) { create(:favorite, user: user, favoritable: league) }

    it 'returns favorite leagues' do
      get '/api/v1/favorites/leagues', headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /api/v1/favorites' do
    it 'adds league to favorites' do
      params = { favorite: { favoritable_type: 'League', favoritable_id: league.id } }
      post '/api/v1/favorites', params: params, headers: auth_headers(user)

      expect(response).to have_http_status(:created)
      expect(user.favorites.count).to eq(1)
    end

    it 'returns error for duplicate favorite' do
      create(:favorite, user: user, favoritable: league)
      params = { favorite: { favoritable_type: 'League', favoritable_id: league.id } }
      post '/api/v1/favorites', params: params, headers: auth_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'returns error for invalid type' do
      params = { favorite: { favoritable_type: 'Invalid', favoritable_id: 1 } }
      post '/api/v1/favorites', params: params, headers: auth_headers(user)

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'DELETE /api/v1/favorites/:id' do
    let!(:favorite) { create(:favorite, user: user, favoritable: league) }

    it 'removes from favorites' do
      delete "/api/v1/favorites/#{favorite.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      expect(user.favorites.count).to eq(0)
    end

    it 'returns 404 for missing favorite' do
      delete '/api/v1/favorites/999999', headers: auth_headers(user)
      expect(response).to have_http_status(:not_found)
    end
  end
end
