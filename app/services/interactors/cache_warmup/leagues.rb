module Interactors
  module CacheWarmup
    class Leagues < Interactors::Base
      LEAGUE_KEY_PREFIX = 'league:'.freeze
      TTL_1_HOUR        = 3600

      def call
        warm_leagues
      end

      private

      def warm_leagues
        League.includes(:country).find_each do |league|
          key = "#{LEAGUE_KEY_PREFIX}#{league.id}"
          RedisService.set(key, league.to_json, ex: TTL_1_HOUR)
        end

        log "Warmed #{League.count} leagues"
      end
    end
  end
end
