RSpec.describe 'Api::V1::Auth', type: :request do
  let!(:user) { create(:user, email: 'test@example.com', password: 'password123') }

  describe 'POST /api/v1/auth/sign_in' do
    context 'with valid credentials' do
      it 'returns JWT token' do
        post '/api/v1/auth/sign_in', params: { user: { email: 'test@example.com', password: 'password123' } }, as: :json
        expect(response).to have_http_status(:ok)
        expect(json_response['token']).to be_present
        expect(json_response['data']).to be_present
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized' do
        post '/api/v1/auth/sign_in', params: { user: { email: 'test@example.com', password: 'wrong' } }, as: :json
        expect(response).to have_http_status(:unauthorized)
        expect(json_response['error']).to be_present
      end
    end
  end

  describe 'POST /api/v1/auth/sign_up' do
    it 'creates user and returns token' do
      post '/api/v1/auth/sign_up',
           params: {
             user: {
               email:                 'new@example.com',
               password:              'password123',
               password_confirmation: 'password123',
               first_name:            'John',
               last_name:             'Doe'
             }
           },
           as: :json

      expect(response).to have_http_status(:created)
      expect(json_response['token']).to be_present
    end

    it 'returns error for invalid data' do
      post '/api/v1/auth/sign_up', params: { user: { email: 'invalid', password: '123' } }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'DELETE /api/v1/auth/sign_out' do
    it 'signs out successfully' do
      token = JwtService.encode(user_id: user.id)
      delete '/api/v1/auth/sign_out', headers: { 'Authorization' => "Bearer #{token}" }, as: :json
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v1/auth/me' do
    it 'returns current user' do
      token = JwtService.encode(user_id: user.id)
      get '/api/v1/auth/me', headers: { 'Authorization' => "Bearer #{token}" }, as: :json
      expect(response).to have_http_status(:ok)
      expect(json_response['data']['attributes']['email']).to eq(user.email)
    end

    it 'returns unauthorized without token' do
      get '/api/v1/auth/me', as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
