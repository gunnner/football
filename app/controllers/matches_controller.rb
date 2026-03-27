class MatchesController < ApplicationController
  before_action :authenticate_user!

  def index
    @matches = Match.includes(:home_team, :away_team, :league)
                    .order(date: :asc)

    @matches =
      case params[:status]
      when 'live'     then @matches.live
      when 'finished' then @matches.finished
      when 'upcoming' then @matches.upcoming
      else                 @matches.today
      end
  end

  def show
    @match = Match.includes(
      :home_team, :away_team, :league,
      :match_events, :match_statistics, :match_lineups
    ).find(params[:id])
  end
end
