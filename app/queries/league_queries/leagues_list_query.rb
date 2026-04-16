module LeagueQueries
  class LeaguesListQuery
    def initialize(country_code, country_name)
      @country_code = country_code
      @country_name = country_name
    end

    def call
      scope = League.includes(:country).where(external_id: FootballConfig.active_league_ids)
      scope = scope.by_country(country_code)                   if country_code.present?
      scope = scope.where('name ILIKE ?', "%#{country_name}%") if country_name.present?

      scope
    end

    private

    attr_reader :country_code, :country_name
  end
end
