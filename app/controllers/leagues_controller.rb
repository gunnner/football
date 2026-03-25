class LeaguesController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    @leagues = League.includes(:country).order(:name)
  end

  def show
    @league    = League.includes(:country).find(params[:id])
    @season    = params[:season] || Date.today.year
    @standings = Standing.where(league: @league, season: @season)
                         .includes(:team)
                         .ordered
  end
end
