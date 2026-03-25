class TokenBlacklistService
  PREFIX = 'jwt:blacklist:'.freeze

  class << self
    def add(token)
      payload = JwtService.decode(token)
      ttl = payload[:exp] - Time.current.to_i
      return if ttl <= 0

      RedisService.set("#{PREFIX}#{token}", '1', ex: ttl)
    rescue Highlightly::UnauthorizedError
      nil
    end

    def blacklisted?(token)
      RedisService.exists?("#{PREFIX}#{token}")
    end
  end
end
