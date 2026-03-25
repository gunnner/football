class JwtService
  ALGORITHM  = 'HS256'.freeze
  EXPIRATION = 24.hours

  class << self
    def encode(payload)
      payload[:exp] ||= EXPIRATION.from_now.to_i
      JWT.encode(payload, secret_key, ALGORITHM)
    end

    def decode(token)
      decoded = JWT.decode(
        token,
        secret_key,
        true,
        { algorithm: ALGORITHM }
      )
      HashWithIndifferentAccess.new(decoded.first)
    rescue JWT::ExpiredSignature
      raise Highlightly::UnauthorizedError, 'Token has expired'
    rescue JWT::DecodeError
      raise Highlightly::UnauthorizedError, 'Invalid token'
    end

    def valid?(token)
      decode(token)
      true
    rescue Highlightly::UnauthorizedError
      false
    end

    private

    def secret_key
      Rails.application.credentials.secret_key_base || ENV.fetch('SECRET_KEY_BASE')
    end
  end
end
