class LeaguesController < ApplicationController
  skip_before_action :authenticate_user!

  def index; end

  def show
    @league = League.find_by!(
      id:          params[:id],
      external_id: FootballConfig.active_league_ids
    )
  end
end
