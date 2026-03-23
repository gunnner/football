module Highlightly
  module Importers
    class HighlightImporter < BaseImporter
      def call(date: Date.today, limit: 40)
        log "Starting highlights import for #{date}..."

        data   = @client.highlights(date: date.to_s, limit: limit)
        result = upsert_highlights(data)

        log "Done. Imported: #{result[:imported]}"
        result
      end

      private

      def upsert_highlights(data)
        return { imported: 0 } if data.blank?

        ensure_matches_exist(data)

        match_ids = Match.pluck(:external_id, :id).to_h
        return if match_ids.blank?

        records = data.filter_map do |highlight|
          next if highlight.blank?

          match_id = match_ids[highlight['match']['id']]
          next if match_id.blank?

          {
            external_id:    highlight['id'],
            match_id:       match_id,
            highlight_type: highlight['type'],
            title:          highlight['title'],
            description:    highlight['description'],
            url:            highlight['url'],
            embed_url:      highlight['embedUrl'],
            img_url:        highlight['imgUrl'],
            source:         highlight['source'],
            channel:        highlight['channel'],
            created_at:     Time.current,
            updated_at:     Time.current
          }
        end

        return { imported: 0 } if records.blank?

        Highlight.upsert_all(
          records,
          unique_by: :external_id,
          update_only: %i[title description url embed_url img_url]
        )

        { imported: records.size }
      rescue StandardError => e
        log_error "Failed to upsert highlights: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end

      def ensure_matches_exist(data)
        existing_ids = Match.pluck(:external_id).to_set

        data.each do |highlight|
          next if highlight['match']['id'].in?(existing_ids)

          import_match(highlight['match'])
        end
      end

      def import_match(match_data)
        home_team = Team.find_or_create_by!(external_id: match_data['homeTeam']['id']) do |t|
          t.name = match_data['homeTeam']['name']
          t.logo = match_data['homeTeam']['logo']
        end

        away_team = Team.find_or_create_by!(external_id: match_data['awayTeam']['id']) do |t|
          t.name = match_data['awayTeam']['name']
          t.logo = match_data['awayTeam']['logo']
        end

        country = Country.find_by(code: match_data['country']['code'])
        return unless country

        league = League.find_or_create_by!(external_id: match_data['league']['id']) do |l|
          l.name    = match_data['league']['name']
          l.logo    = match_data['league']['logo']
          l.country = country
          l.seasons = [ match_data['league']['season'] ]
        end

        Match.find_or_create_by!(external_id: match_data['id']) do |m|
          m.league    = league
          m.home_team = home_team
          m.away_team = away_team
          m.date      = match_data['date']
          m.status    = 'Finished'
          m.round     = match_data['round']
        end
      rescue StandardError => e
        log_error "Failed to create match #{match_data['id']}: #{e.message}"
      end
    end
  end
end
