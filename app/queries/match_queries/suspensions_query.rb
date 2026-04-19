module MatchQueries
  class SuspensionsQuery
    def initialize(match, team)
      @match = match
      @team  = team
    end

    def call
      red_card_suspended
    end

    private

    attr_reader :match, :team

    # Players who received a red card or second yellow in the previous league match
    def red_card_suspended
      prev_match = Match
        .joins(:match_events)
        .where(match_events: { team_external_id: team.external_id })
        .where(status: MatchConstants::FINISHED_STATUSES)
        .where('matches.date < ?', match.date)
        .order('matches.date DESC')
        .first

      return [] unless prev_match

      MatchEvent
        .where(match_id: prev_match.id, team_external_id: team.external_id, event_type: ['Red Card', 'Yellow Red Card'])
        .map do |e|
          player = Player.find_by(external_id: e.player_external_id)
          {
            player_name:  e.player_name,
            player_logo:  player&.logo,
            player_path:  player ? "/players/#{player.id}" : nil,
            reason:       'suspension',
            detail:       e.event_type == 'Yellow Red Card' ? 'Second yellow (prev. match)' : 'Red card (prev. match)'
          }
        end
    end
  end
end
