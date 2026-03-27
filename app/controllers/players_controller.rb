class PlayersController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    @players = Player.in_active_leagues.order(:name)
  end

  def show
    @player    = Player.includes(:player_profile).find(params[:id])
    @stats     = @player.player_statistics.order(season: :desc)
    @transfers = @player.player_transfers.order(created_at: :desc)
  end
end
