module CacheService
  module Store
    class << self
      def fetch(key, ttl:)
        cached = RedisService.get(key)
        return JSON.parse(cached, symbolize_names: false) if cached.present?

        data = yield
        RedisService.set(key, data.to_json, ex: ttl)
        data
      end

      def write(key, data, ttl:)
        RedisService.set(key, data.to_json, ex: ttl)
      end

      def read(key)
        cached = RedisService.get(key)
        JSON.parse(cached, symbolize_names: false) if cached.present?
      end

      def invalidate(key)
        RedisService.del(key)
      end

      def invalidate_pattern(pattern)
        RedisService.with_redis do |redis|
          keys = redis.keys(pattern)
          redis.del(*keys) if keys.any?
        end
      end

      def exists?(key)
        RedisService.exists?(key)
      end
    end
  end
end
