require 'faraday'
require 'faraday/retry'
require_relative 'error'

module Highlightly
  class Client
    include Endpoints

    BASE_URL = 'https://soccer.highlightly.net'.freeze
    RATE_LIMIT_THRESHOLD = 7000

    def initialize
      @connection = build_connection
    end

    def countries(country_code = nil)
      path = country_code.present? ? "#{Endpoints::COUNTRIES}/#{country_code}"
                                   : Endpoints::COUNTRIES
      get(path)
    end

    def leagues(params = {})
      get(Endpoints::LEAGUES, params)&.dig('data')
    end

    def league(id)
      get("#{Endpoints::LEAGUES}/#{id}")
    end

    def teams(params = {})
      get(Endpoints::TEAMS, params)&.dig('data')
    end

    def team(id)
      get("#{Endpoints::TEAMS}/#{id}")
    end

    def team_statistics(id, params = {})
      get("#{Endpoints::TEAMS}/statistics/#{id}", params)
    end

    def matches(params = {})
      get(Endpoints::MATCHES, params)&.dig('data')
    end

    def match(id)
      get("#{Endpoints::MATCHES}/#{id}")
    end

    def standings(params = {})
      get(Endpoints::STANDINGS, params)
    end
    # https://sports.highlightly.net/football/highlights?countryCode=GB-ENG&countryName=Englans&leagueName=S%C3%BCper+Lig&leagueId=173537&date=2023-08-11&timezone=Europe%2FLondon&season=2023&matchId=914490490&homeTeamId=850082&awayTeamId=856039&homeTeamName=Trabzonspor&awayTeamName=Antalyaspor&limit=40&offset=0
    def highlights(params = {})
      get(Endpoints::HIGHLIGHTS, params)&.dig('data')
    end

    def highlight_geo_restrictions(highlight_id)
      get("highlights/geo-restrictions/#{highlight_id}")
    rescue Highlightly::NotFoundError
      nil
    end

    def lineups(match_id)
      get("#{Endpoints::LINEUPS}/#{match_id}")
    end

    def statistics(match_id)
      get("#{Endpoints::STATISTICS}/#{match_id}")
    end

    def events(match_id)
      get("#{Endpoints::EVENTS}/#{match_id}")
    end

    def players(params = {})
      get(Endpoints::PLAYERS, params)['data']
    end

    def player(id)
      get("#{Endpoints::PLAYERS}/#{id}").first
    end

    def player_statistics(id)
      get("#{Endpoints::PLAYERS}/#{id}/statistics")&.first
    end

    def box_score(match_id)
      get("#{Endpoints::BOX_SCORE}/#{match_id}")
    end

    def bookmakers(params = {})
      get(Endpoints::BOOKMAKERS, params)
    end

    def odds(params = {})
      get(Endpoints::ODDS, params)
    end

    def last_five_games(team_id)
      get(Endpoints::LAST_FIVE, teamId: team_id)
    end

    def head_to_head(team1_id, team2_id)
      get(Endpoints::H2H, teamIdOne: team1_id, teamIdTwo: team2_id)
    end

    private

    def build_connection
      Faraday.new(url: BASE_URL) do |f|
        f.request :json
        f.request :retry, retry_options

        f.response :json
        f.response :raise_error
        f.response :logger, Rails.logger, headers: false, bodies: false do |logger|
          logger.filter(/(x-rapidapi-key:)\s*\S+/, '\1 [FILTERED]')
        end

        f.headers['x-rapidapi-key'] = api_key
        f.headers['Content-Type']   = 'application/json'

        f.adapter Faraday.default_adapter
      end
    end

    def retry_options
      {
        max:                 3,
        interval:            0.5,
        interval_randomness: 0.5,
        backoff_factor:      2,
        exceptions: [
          Faraday::TimeoutError,
          Faraday::ConnectionFailed,
          Faraday::ServerError
        ]
      }
    end

    def api_key
      Rails.application.credentials.dig(:api_football, :key) ||
      ENV['API_FOOTBALL_KEY']                                ||
      raise(Highlightly::UnauthorizedError, 'API key not configured')
    end

    def get(path, params = {})
      check_rate_limit!
      @response = @connection.get(path, params)
      set_quantity_attempts_to_redis
      @response.body
    rescue Faraday::ClientError => e
      handle_client_error(e)
    rescue Faraday::ServerError => e
      raise Highlightly::ServerError, "Server error: #{e.message}"
    rescue Faraday::ConnectionFailed, Faraday::TimeoutError => e
      raise Highlightly::Error, "Connection error: #{e.message}"
    end

    def check_rate_limit!
      requested_attempts = RedisService.get('requested_attempts').to_i

      if requested_attempts >= RATE_LIMIT_THRESHOLD
        Rails.logger.info("[Highlightly API] Requests performed: #{requested_attempts}")

        raise Highlightly::RateLimitError, "Rate limit threshold reached. Requests performed: #{requested_attempts}"
      end
    end

    def set_quantity_attempts_to_redis
      requested_attempts = requests_limit - requests_remaining
      ex = Time.current.end_of_day.to_i - Time.current.to_i
      RedisService.set('requested_attempts', requested_attempts, ex: ex)
    end

    def requests_limit
      @response.headers['x-ratelimit-requests-limit'].to_i
    end

    def requests_remaining
      @response.headers['x-ratelimit-requests-remaining'].to_i
    end

    def handle_client_error(error)
      case error.response[:status].to_i
      when 401 then raise Highlightly::UnauthorizedError, 'Invalid API key'
      when 404 then raise Highlightly::NotFoundError,     'Resource not found'
      when 429 then raise Highlightly::RateLimitError,    'API rate limit exceeded'
      else
        raise Highlightly::Error, "Client error: #{error.message}"
      end
    end
  end
end
