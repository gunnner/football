class SearchService
  SEARCHABLE_MODELS = [ Team, Player, League ].freeze

  def initialize(query)
    @query = query.to_s.strip
  end

  def call
    return empty_result if @query.blank?

    {
      teams:   search_teams,
      players: search_players,
      leagues: search_leagues
    }
  end

  private

  def search_teams
    results = Team.search(build_query).records.to_a
    active_team_ids = Team.in_active_leagues.pluck(:id)
    results.select { active_team_ids.include?(it.id) }
  rescue StandardError => e
    Rails.logger.error("[SearchService] Teams error: #{e.message}")
    []
  end

  def search_players
    results = Player.search(build_query).records.to_a
    active_player_ids = Player.in_active_leagues.pluck(:id)
    results.select { active_player_ids.include?(it.id) }
  rescue StandardError => e
    Rails.logger.error("[SearchService] Players error: #{e.message}")
    []
  end

  def search_leagues
    results = League.search(build_query).records.to_a
    active_league_ids = FootballConfig.active_league_ids
    results.select { active_league_ids.include?(it.external_id) }
  rescue StandardError => e
    Rails.logger.error("[SearchService] Leagues error: #{e.message}")
    []
  end

  def search(model)
    model.search(build_query).records.to_a
  rescue StandardError => e
    Rails.logger.error("[SearchService] Error: #{e.message}")
    []
  end

  def build_query
    {
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query:     @query,
                fields:    %w[name^3 full_name^2 name_exact^4 country_name],
                type:      :best_fields,
                fuzziness: 'AUTO'
              }
            },
            {
              wildcard: {
                name_exact: {
                  value:            "#{@query.downcase}*",
                  case_insensitive: true,
                  boost:            3
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      min_score: 1.0,
      size:      10
    }
  end

  def empty_result
    { teams: [], players: [], leagues: [] }
  end
end
