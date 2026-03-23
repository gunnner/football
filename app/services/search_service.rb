class SearchService
  SEARCHABLE_MODELS = [ Team, Player, League ].freeze

  def initialize(query)
    @query = query.to_s.strip
  end

  def call
    return empty_result if @query.blank?

    {
      teams:   search(Team),
      players: search(Player),
      leagues: search(League)
    }
  end

  private

  def search(model)
    model.search(build_query).records.to_a
  rescue StandardError => e
    Rails.logger.error("[SearchService] Error: #{e.message}")
    []
  end

  def build_query
    {
      query: {
        multi_match: {
          query:     @query,
          fields:    %w[name^3 full_name^2 name_exact^4 country_name],
          type:      :best_fields,
          fuzziness: :AUTO
        }
      },
      size: 10
    }
  end

  def empty_result
    { teams: [], players: [], leagues: [] }
  end
end
