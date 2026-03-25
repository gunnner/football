class TokenBlacklistService
  PREFIX = 'jwt:blacklist:'.freeze

  class << self
    def add(token)
      payload = JwtService.decode(token)
      ttl     = payload[:exp] - Time.current.to_i
      return if ttl <= 0

      RedisService.set(key(token), '1', ex: ttl)
    rescue StandardError
      nil
    end

    def blacklisted?(token)
      RedisService.exists?(key(token))
    end

    private

    def key(token)
      "#{PREFIX}#{Digest::SHA256.hexdigest(token)}"
    end
  end
end
