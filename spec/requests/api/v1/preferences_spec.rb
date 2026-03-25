RSpec.describe 'Api::V1::Preferences', type: :request do
  let!(:user) { create(:user) }

  describe 'GET /api/v1/preference' do
    it 'returns user preference' do
      get '/api/v1/preference', headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it 'creates default preference if not exists' do
      expect(user.user_preference).to be_nil
      get '/api/v1/preference', headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'PATCH /api/v1/preference' do
    it 'updates timezone' do
      patch '/api/v1/preference', params: { preference: { timezone: 'Kyiv' } }, headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it 'updates notification settings' do
      params = { preference: { notification_settings: { match_start: false, goals: true } } }
      patch '/api/v1/preference', params: params, headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it 'returns error for invalid timezone' do
      patch '/api/v1/preference', params: { preference: { timezone: 'Invalid/Zone' } }, headers: auth_headers(user)
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
