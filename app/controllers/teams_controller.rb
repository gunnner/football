class TeamsController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    @teams = Team.order(:name)
  end

  def show
    @team    = Team.find(params[:id])
    @matches = @team.matches
                    .includes(:home_team, :away_team, :league)
                    .order(date: :desc)
                    .limit(10)
  end
end
