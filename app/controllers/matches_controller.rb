class MatchesController < ApplicationController
  before_action :authenticate_user!

  def index
    @matches = Match.today
                    .includes(:home_team, :away_team, :league)
                    .order(date: :asc)
  end

  def show
    @match = Match.includes(
      :home_team, :away_team, :league,
      :match_events, :match_statistics, :match_lineups
    ).find(params[:id])
  end
end
