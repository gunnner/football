class MatchesController < ApplicationController
  def index
    @date = params[:date] ? Date.parse(params[:date]) : Date.today
  end

  def show
    @match = Match.includes(:home_team, :away_team).find(params[:id])
  end
end
