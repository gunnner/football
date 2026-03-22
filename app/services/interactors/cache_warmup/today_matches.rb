module Interactors
  module CacheWarmup
    class TodayMatches < Interactors::Base
      TODAY_MATCHES_KEY = 'matches:today'.freeze
      TTL_5_MIN         = 300

      def call
        warm_today_matches
      end

      private

      def warm_today_matches
        matches = Match.today.includes(:home_team, :away_team, :league)
        RedisService.set(TODAY_MATCHES_KEY, matches.to_json, ex: TTL_5_MIN)

        log "Warmed #{matches.count} today matches"
      end
    end
  end
end
