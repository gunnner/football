module RedisService
  class << self
    def client
      @client ||= ConnectionPool.new(size: Config.pool_size, timeout: 5) do
        Redis.new(url: Config.url)
      end
    end

    def get(key)
      execute { it.get(key) }
    end

    def set(key, value, **options)
      execute { it.set(key, value, **options) }
    end

    def del(*keys)
      execute { it.del(*keys) }
    end

    def exists?(key)
      execute(default: false) { !!it.exists?(key) }
    end

    def hset(key, *args, **options)
      execute { it.hset(key, *args, **options) }
    end

    def hgetall(key)
      execute(default: {}) { it.hgetall(key) }
    end

    def with_redis
      execute { |r| yield(r) }
    end

    private

    def execute(default: nil)
      client.with { |conn| yield(conn) }
    rescue Redis::BaseError => e
      handle_error(e)
      default
    end

    def handle_error(e)
      Sentry.capture_exception(e, extra: { service: 'RedisService' })
      Rails.logger.error("[RedisService] Error: #{e.message}")
    end
  end

  module Config
    def self.url
      ENV.fetch('REDIS_URL') { 'redis://localhost:6379/1' }
    end

    def self.pool_size
      ENV.fetch('REDIS_POOL_SIZE') { 10 }.to_i
    end
  end
end
