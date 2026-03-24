module Api
  module V1
    class SearchController < BaseController
      def index
        # debugger
        query   = params.require(:q)
        type    = params[:type]
        results = SearchService.new(query).call

        results = filter_by_type(results, type) if type.present?

        render json: {
          data: {
            teams:   TeamSerializer.new(results[:teams]).serializable_hash,
            players: PlayerSerializer.new(results[:players]).serializable_hash,
            leagues: LeagueSerializer.new(results[:leagues]).serializable_hash
          }
        }
      end

      private

      def filter_by_type(results, type)
        case type.to_s
        when 'team'   then results.merge(players: [], leagues: [])
        when 'player' then results.merge(teams: [], leagues: [])
        when 'league' then results.merge(teams: [],   players: [])
        else records
        end
      end
    end
  end
end
