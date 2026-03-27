class SearchController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    @query = params[:q]&.strip
    return if @query.blank? || @query.length < 2

    results = SearchService.new(@query).call

    @teams   = results[:teams]   || []
    @players = results[:players] || []
    @leagues = results[:leagues] || []
  end
end
