module Interactors
  module CacheWarmup
    class TodayMatches < Interactors::Base
      def call
        warm_live_matches
      end

      private

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
