RSpec.describe 'Api::V1::Matches', type: :request do
  let!(:league)    { create(:league) }
  let!(:home_team) { create(:team) }
  let!(:away_team) { create(:team) }
  let!(:match) do
    create(:match,
      league:    league,
      home_team: home_team,
      away_team: away_team,
      status:    'Not started',
      date:      Time.current
    )
  end

  describe 'GET /api/v1/matches' do
    it 'returns matches' do
      get '/api/v1/matches'
      expect(response).to have_http_status(:ok)
      expect(json_response['data']).to be_an(Array)
    end

    it 'filters by date' do
      get '/api/v1/matches', params: { date: Date.today.to_s }
      expect(response).to have_http_status(:ok)
    end

    it 'filters by status' do
      get '/api/v1/matches', params: { status: 'today' }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v1/matches/live' do
    it 'returns live matches' do
      get '/api/v1/matches/live'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v1/matches/:id' do
    it 'returns match' do
      get "/api/v1/matches/#{match.id}"
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for missing match' do
      get '/api/v1/matches/999999'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /api/v1/matches/:id/events' do
    let!(:event) { create(:match_event, match: match) }

    it 'returns events' do
      get "/api/v1/matches/#{match.id}/events"
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v1/matches/:id/lineups' do
    let!(:lineup) { create(:match_lineup, match: match) }

    it 'returns lineups' do
      get "/api/v1/matches/#{match.id}/lineups"
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v1/matches/h2h' do
    it 'returns h2h matches' do
      get '/api/v1/matches/h2h', params: { team1_id: home_team.id, team2_id: away_team.id }
      expect(response).to have_http_status(:ok)
    end

    it 'returns 400 without required params' do
      get '/api/v1/matches/h2h'
      expect(response).to have_http_status(:bad_request)
    end
  end
end
