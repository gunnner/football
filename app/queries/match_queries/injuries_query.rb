module MatchQueries
  class InjuriesQuery
    def initialize(team)
      @team = team
    end

    def call
      player_ids = recent_team_player_ids
      return [] if player_ids.blank?

      today    = Date.today.to_s
      injuries = PlayerInjury
        .where(player_id: player_ids)
        .where('to_date IS NULL OR to_date >= ?', today)
        .includes(:player)
        .order(from_date: :desc)

      injuries.group_by(&:player_id).values.map(&:first).map { |inj| build_row(inj) }
    end

    private

    attr_reader :team

    def recent_team_player_ids
      player_ext_ids = BoxScore
        .joins(:match)
        .where(team_external_id: team.external_id)
        .where(matches: { status: MatchConstants::FINISHED_STATUSES })
        .order('matches.date DESC')
        .limit(300)
        .pluck(:player_external_id)
        .uniq
        .first(40)

      Player.where(external_id: player_ext_ids).pluck(:id)
    end

    def build_row(inj)
      {
        player_name:          inj.player.name,
        player_logo:          inj.player.logo,
        player_path:          "/players/#{inj.player_id}",
        reason:               inj.reason,
        from_date:            inj.from_date,
        to_date:              inj.to_date,
        missed_games:         inj.missed_games,
        absent_duration_days: inj.absent_duration_days
      }
    end
  end
end
