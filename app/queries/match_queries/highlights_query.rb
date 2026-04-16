module MatchQueries
  class HighlightsQuery
    def initialize(match, country)
      @match   = match
      @country = country
    end

    def call
      highlights = match.highlights.select { it.embeddable != false }

      if country
        highlights.select do |highlight|
          allowed = highlight.allowed_countries.presence
          blocked = highlight.blocked_countries.presence
          next false if blocked&.include?(country)
          next false if allowed && !allowed.include?(country)

          true
        end
      end
    end

    private

    attr_reader :match, :country
  end
end
