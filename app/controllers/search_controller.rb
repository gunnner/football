class SearchController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    return if params[:q].blank?

    @query   = params[:q]
    @results = SearchService.new(@query).call
  end
end
