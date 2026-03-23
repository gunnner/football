module Interactors
  module CacheWarmup
    class TodayMatches < Interactors::Base
      def call
        warm_today_matches
        warm_live_matches
      end

      private

      def warm_today_matches
        matches = Match.today.includes(:home_team, :away_team, :league)
        CacheService::Store.write(
          CacheService::Keys.today_matches,
          matches.as_json(include: { home_team: {}, away_team: {}, league: {} }),
          ttl: CacheService::Ttl::MIN_5
        )

        log "Warmed #{matches.count} today matches"
      end

      def warm_live_matches
        matches = Match.live.includes(:home_team, :away_team, :league)
        CacheService::Store.write(
          CacheService::Keys.live_matches,
          matches.as_json(include: { home_team: {}, away_team: {}, league: {} }),
          ttl: CacheService::Ttl::LIVE
        )

        log "Warmed #{matches.count} live matches"
      end
    end
  end
end
