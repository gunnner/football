module Interactors
  module CacheWarmup
    class Leagues < Interactors::Base
      def call
        warm_leagues
      end

      private

      def warm_leagues
        League.includes(:country).find_each do |league|
          CacheService::Store.write(
            CacheService::Keys.league(league.id),
            league.as_json(include: :country),
            ttl: CacheService::Ttl::HOUR_1
          )
        end

        log "Warmed #{League.count} leagues"
      end
    end
  end
end
