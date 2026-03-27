class TeamsController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    @teams = Team.in_active_leagues.order(:name)
  end

  def show
    @team    = Team.find(params[:id])
    @matches = @team.matches
                    .includes(:home_team, :away_team, :league)
                    .where('home_team_id = ? OR away_team_id = ?', @team.id, @team.id)
                    .order(date: :desc)
                    .limit(10)
  end
end
