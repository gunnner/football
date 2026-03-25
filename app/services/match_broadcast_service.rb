class MatchBroadcastService
  class << self
    def broadcast_update(match)
      notify_stream(
        stream_name(match),
        { type: 'match_update', match: match_data(match) }
      )
    end

    def broadcast_goal(match, event)
      notify_stream(
        stream_name(match),
        { type: 'goal', match: match_data(match), event: event_data(event) }
      )
    end

    def broadcast_match_start(match)
      notify_stream(
        stream_name(match),
        { type: 'match_start', match: match_data(match) }
      )
    end

    def broadcast_match_end(match)
      notify_stream(
        stream_name(match),
        { type: 'match_end', match: match_data(match) }
      )
    end

    private

    def notify_stream(stream_name, data)
      ActionCable.server.broadcast(stream_name, data)
    end

    def stream_name(match)
      "match_#{match.id}"
    end

    def match_data(match)
      {
        id:              match.id,
        status:          match.status,
        clock:           match.clock,
        score_current:   match.score_current,
        score_penalties: match.score_penalties,
        home_team:       { id: match.home_team_id, name: match.home_team&.name },
        away_team:       { id: match.away_team_id, name: match.away_team&.name }
      }
    end

    def event_data(event)
      {
        id:          event.id,
        time:        event.time,
        event_type:  event.event_type,
        team_name:   event.team_name,
        player_name: event.player_name
      }
    end
  end
end
