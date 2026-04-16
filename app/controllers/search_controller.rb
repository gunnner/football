class SearchController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    @query = params[:q]&.strip
    return if @query.blank? || @query.length < 2

    results = SearchService.new(@query).call

    @teams   = results[:teams]   || []
    @players = results[:players] || []
    @leagues = results[:leagues] || []

    respond_to do |format|
      format.html
      format.json do
        render json: {
          teams:   @teams.map   { |t| { id: t.id, name: t.name, logo: t.logo, url: team_path(t),   type: 'team'   } },
          players: @players.map { |p| { id: p.id, name: p.name, logo: p.logo, url: player_path(p), type: 'player' } },
          leagues: @leagues.map { |l| { id: l.id, name: l.name, logo: l.logo, url: league_path(l), type: 'league' } }
        }
      end
    end
  end
end
