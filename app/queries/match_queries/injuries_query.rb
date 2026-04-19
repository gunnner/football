module MatchQueries
  class InjuriesQuery
    REASON_LABELS = {
      'Ill'      => 'Illness'
    }.freeze

    def initialize(team, match_date: Date.today)
      @team       = team
      @match_date = match_date
    end

    def call
      player_ids = recent_team_player_ids
      return [] if player_ids.blank?

      injuries = PlayerInjury
        .where(player_id: player_ids)
        .includes(:player)
        .order(from_date: :desc)

      # Filter in Ruby — to_date is stored as 'DD.MM.YYYY' string, not a real date column
      active = injuries.select { active_on_match_date?(it) }

      # One injury per player (most recent)
      active.uniq(&:player_id).map { build_row(it) }
    end

    private

    attr_reader :team, :match_date

    def active_on_match_date?(injury)
      return true if injury.to_date.blank?

      parsed = Date.strptime(injury.to_date, '%d.%m.%Y')
      parsed >= match_date
    rescue Date::Error
      false
    end

    def recent_team_player_ids
      player_ext_ids = BoxScore
        .joins(:match)
        .where(team_external_id: team.external_id)
        .where(matches: { status: MatchConstants::FINISHED_STATUSES })
        .order('matches.date DESC')
        .limit(500)
        .pluck(:player_external_id)
        .uniq

      Player.where(external_id: player_ext_ids).pluck(:id)
    end

    def format_date(str)
      return if str.blank?

      Date.strptime(str, '%d.%m.%Y').strftime('%-d %b %Y')
    rescue Date::Error
      nil
    end

    def humanize_reason(reason)
      REASON_LABELS[reason] || reason
    end

    def build_row(injury)
      {
        player_name: injury.player.name,
        player_logo: injury.player.logo,
        player_path: "/players/#{injury.player_id}",
        reason:      humanize_reason(injury.reason),
        from_date:   format_date(injury.from_date),
        to_date:     format_date(injury.to_date),
      }
    end
  end
end
