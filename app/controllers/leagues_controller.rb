class LeaguesController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    @leagues = League.joins(:country)
                     .where(external_id: FootballConfig.active_league_ids)
                     .order(:name)
  end

  def show
    @league = League.find_by!(
      id:          params[:id],
      external_id: FootballConfig.active_league_ids
    )

    @available_seasons = Standing.where(league: @league)
                                  .distinct
                                  .pluck(:season)
                                  .sort
                                  .reverse

    @season = params[:season]&.to_i || @available_seasons.first || Date.today.year

    @standings = Standing.where(league: @league, season: @season)
                         .includes(:team)
                         .ordered
  end
end
