module MatchQueries
  class LineupsQuery
    def initialize(match)
      @match = match
    end

    def call
      # A lineup record with empty initial_lineup (e.g. API returned "Unknown" formation)
      # is not usable — treat as no lineups and fall back to last-known.
      has_lineups = match.match_lineups.where('jsonb_array_length(initial_lineup) > 0').exists?

      if has_lineups
        player_map = MatchQueries::PlayerIdMapQuery.new(match).call
        data = match.match_lineups.map { |l| build_lineup_row(l, player_map) }
        { data: data, last_known: false }
      else
        build_last_known_lineups
      end
    end

    def ttl_key
      has_lineups = match.match_lineups.where('jsonb_array_length(initial_lineup) > 0').exists?
      has_lineups ? CacheService::Ttl::HOUR_1
                  : CacheService::Ttl::MIN_5
    end

    private

    attr_reader :match

    def add_player_path(player, player_map)
      info = player_map[player['id']]
      player.merge(
        'path' => info ? "/players/#{info[:id]}" : nil,
        'logo' => info&.dig(:logo)
      )
    end

    def build_lineup_row(lineup, player_map)
      {
        team_external_id: lineup.team_external_id,
        formation:        lineup.formation,
        initial_lineup:   lineup.initial_lineup.map { |row| row.map { |p| add_player_path(p, player_map) } },
        substitutes:      lineup.substitutes.map { |p| add_player_path(p, player_map) },
        source_match:     nil
      }
    end

    def build_last_known_lineups
      home_lineup = last_known_lineup_for(match.home_team)
      away_lineup = last_known_lineup_for(match.away_team)
      return { data: [], last_known: false } if home_lineup.nil? && away_lineup.nil?

      lineup_records   = [ home_lineup, away_lineup ].compact
      lineup_match_ids = lineup_records.map(&:match_id).uniq
      source_matches   = Match.where(id: lineup_match_ids)
                              .includes(:home_team, :away_team)
                              .index_by(&:id)

      all_ext_ids = lineup_records.flat_map { |l|
        (l.initial_lineup.flatten + l.substitutes).map { |p| p['id'] }
      }.compact.uniq
      lk_player_map = Player.where(external_id: all_ext_ids)
                            .pluck(:external_id, :id, :logo)
                            .each_with_object({}) { |(ext_id, id, logo), h| h[ext_id] = { id: id, logo: logo } }

      data = lineup_records.map do |l|
        src = source_matches[l.match_id]
        {
          team_external_id: l.team_external_id,
          formation:        l.formation,
          initial_lineup:   l.initial_lineup.map { |row| row.map { |p| add_player_path(p, lk_player_map) } },
          substitutes:      l.substitutes.map { |p| add_player_path(p, lk_player_map) },
          source_match:     src ? {
            date:      src.date.strftime('%b %d, %Y'),
            home_team: src.home_team.name,
            away_team: src.away_team.name
          } : nil
        }
      end

      { data: data, last_known: true }
    end

    def last_known_lineup_for(team)
      MatchLineup.joins(:match)
                 .where(team_external_id: team.external_id)
                 .where(matches: { status: MatchConstants::FINISHED_STATUSES })
                 .order('matches.date DESC')
                 .first
    end
  end
end
