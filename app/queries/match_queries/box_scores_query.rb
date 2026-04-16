module MatchQueries
  class BoxScoresQuery
    def initialize(match)
      @match = match
    end

    def call
      scores   = match.box_scores.sort_by { |b| [ b.match_rating ? 0 : 1, -(b.match_rating || 0) ] }
      ev_stats = event_stats
      gk_stats = gk_penalty_stats

      {
        data: scores.map { |b| build_row(b, ev_stats[b.player_external_id], gk_stats) }
      }
    end

    private

    attr_reader :match

    def build_row(b, es, gk)
      es ||= { goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, second_yellows: 0 }
      is_home = b.team_external_id == match.home_team.external_id

      b.as_json.merge(
        goals_scored:                  es[:goals],
        assists:                       es[:assists],
        cards_yellow:                  es[:yellow_cards],
        cards_red:                     es[:red_cards],
        cards_second_yellow:           es[:second_yellows],
        player_logo:                   b.player&.logo,
        player_path:                   b.player_id ? "/players/#{b.player_id}" : nil,
        is_home_team:                  is_home,
        team_path:                     is_home ? "/teams/#{match.home_team_id}" : "/teams/#{match.away_team_id}",
        team_logo:                     is_home ? match.home_team.logo : match.away_team.logo,
        gk_penalties_faced:            gk.dig(b.player_external_id, :penalties_faced),
        gk_penalties_saved:            gk.dig(b.player_external_id, :penalties_saved),
        gk_penalties_conceded:         gk.dig(b.player_external_id, :penalties_conceded),
        gk_penalties_saved_pct:        gk.dig(b.player_external_id, :penalties_saved_pct)
      )
    end

    def event_stats
      stats = Hash.new { |h, k| h[k] = { goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, second_yellows: 0 } }

      # Highlightly API doesn't update goals/assists/cards in box scores during live matches.
      # Derive them from match_events (source of truth for all discrete events).
      match.match_events.each do |e|
        case e.event_type
        when 'Goal', 'Penalty', 'VAR Goal Confirmed'
          stats[e.player_external_id][:goals] += 1
          stats[e.assisting_player_external_id][:assists] += 1 if e.assisting_player_external_id
        when 'Yellow Card'
          stats[e.player_external_id][:yellow_cards] += 1
        when 'Red Card'
          stats[e.player_external_id][:red_cards] += 1
        when 'Yellow-Red Card'
          stats[e.player_external_id][:second_yellows] += 1
        end
      end

      stats
    end

    def gk_penalty_stats
      parse_minute = ->(s) {
        return 0 if s.blank?
        s =~ /(\d+)\+(\d+)/ ? $1.to_i + $2.to_i : s.to_i
      }

      subbed_off_at = match.match_events
        .select { |e| e.event_type == 'Substitution' && e.assisting_player_external_id.present? }
        .each_with_object({}) { |e, h| h[e.assisting_player_external_id] = parse_minute.call(e.time) }

      gk_by_team = match.match_lineups.each_with_object({}) do |lineup, h|
        gks = (lineup.initial_lineup.first || []).select { |p| p['position'] == 'Goalkeeper' }
        h[lineup.team_external_id] = gks.map { |p| { ext_id: p['id'], name: p['name'] } }
      end

      all_team_ids = gk_by_team.keys

      missed_by_team = match.box_scores.each_with_object(Hash.new(0)) do |b, h|
        h[b.team_external_id] += (b.penalties_missed || 0)
      end

      stats = {}

      gk_by_team.each do |team_ext_id, gks|
        opposing_ids = all_team_ids.reject { |t| t == team_ext_id }

        scored_against = match.match_events.select do |e|
          e.event_type == 'Penalty' && opposing_ids.include?(e.team_external_id)
        end

        opponent_missed = opposing_ids.sum { |t| missed_by_team[t] }

        gks.each do |gk|
          subbed_minute = subbed_off_at[gk[:ext_id]]
          conceded = scored_against.count do |e|
            minute = parse_minute.call(e.time)
            subbed_minute.nil? || minute <= subbed_minute
          end
          saved     = subbed_minute.nil? ? opponent_missed : 0
          faced     = conceded + saved
          saved_pct = faced > 0 ? (saved.to_f / faced * 100).round : nil

          stats[gk[:ext_id]] = {
            penalties_faced:     faced,
            penalties_conceded:  conceded,
            penalties_saved:     saved,
            penalties_saved_pct: saved_pct
          }
        end
      end

      stats
    end
  end
end
