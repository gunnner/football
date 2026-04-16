module Interactors
  module CacheWarmup
    class Leagues < Interactors::Base
      def call
        warm_standings
      end

      private

      def warm_standings
        season  = Date.today.year - 1
        leagues = League.where(external_id: FootballConfig.active_league_ids)
        count   = 0

        leagues.each do |league|
          key = CacheService::Keys.league_standings(league.id, season)
          next if CacheService::Store.exists?(key)

          records = Standing.where(league: league, season: season).includes(:team).ordered
          next if records.blank?

          data = StandingSerializer.new(records, include: [ :team ]).serializable_hash
          CacheService::Store.write(key, data, ttl: CacheService::Ttl::MIN_30)
          count += 1
        end

        log "Warmed standings for #{count} leagues (season #{season})"
      end
    end
  end
end
