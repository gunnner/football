module Interactors
  module MatchData
    # Syncs rich match data from client.match(external_id):
    # venue, referee, forecast, predictions, shots, news, top players.
    # Called with already-fetched match_data to avoid extra API calls.
    class SyncMatchDetails < Interactors::Base
      expects do
        required(:match).filled(type?: Match)
        required(:match_data).filled
      end

      def call
        data = context.match_data
        sync_match_meta(data)
        sync_predictions(data)
        sync_shots(data)
        sync_news(data)
      rescue StandardError => e
        log_error "Failed to sync match details #{context.match.id}: #{e.message}"
        fail!(e.message)
      end

      private

      def sync_match_meta(data)
        context.match.update!(
          venue_name:           data.dig('venue', 'name'),
          venue_city:           data.dig('venue', 'city'),
          venue_country:        data.dig('venue', 'country'),
          venue_capacity:       data.dig('venue', 'capacity')&.to_i,
          referee_name:         data.dig('referee', 'name'),
          referee_nationality:  data.dig('referee', 'nationality'),
          forecast_status:      data.dig('forecast', 'status'),
          forecast_temperature: data.dig('forecast', 'temperature')
        )
      end

      def sync_predictions(data)
        predictions = data['predictions'] || {}
        live     = predictions['live']     || []
        prematch = predictions['prematch'] || []
        all      = live + prematch
        return if all.blank?

        records = all.filter_map do |p|
          probs = p['probabilities']
          next unless probs

          {
            match_id:        context.match.id,
            prediction_type: p['type'],
            home_pct:        probs['home']&.to_f,
            draw_pct:        probs['draw']&.to_f,
            away_pct:        probs['away']&.to_f,
            generated_at:    p['generatedAt'],
            created_at:      Time.current,
            updated_at:      Time.current
          }
        end

        return if records.blank?

        MatchPrediction.upsert_all(
          records,
          unique_by: %i[match_id prediction_type generated_at]
        )
      end

      def sync_shots(data)
        home_ext_id = data.dig('homeTeam', 'id')
        away_ext_id = data.dig('awayTeam', 'id')

        home_shots = (data.dig('homeTeam', 'shots') || []).map { |s| s.merge('team_external_id' => home_ext_id) }
        away_shots = (data.dig('awayTeam', 'shots') || []).map { |s| s.merge('team_external_id' => away_ext_id) }
        all_shots  = home_shots + away_shots
        return if all_shots.blank?

        # Delete existing shots and re-insert (shots don't have a stable unique key)
        MatchShot.where(match_id: context.match.id).delete_all

        records = all_shots.map do |s|
          {
            match_id:        context.match.id,
            team_external_id: s['team_external_id'],
            player_name:     s['playerName'],
            time:            s['time'],
            outcome:         s['outcome'],
            goal_target:     s['goalTarget'],
            created_at:      Time.current,
            updated_at:      Time.current
          }
        end

        MatchShot.insert_all(records)
      end

      def sync_news(data)
        articles = data['news'] || []
        return if articles.blank?

        records = articles.filter_map do |a|
          next if a['url'].blank? || a['title'].blank?

          {
            match_id:     context.match.id,
            url:          a['url'],
            title:        a['title'],
            image_url:    a['image'],
            published_at: a['datePublished'],
            created_at:   Time.current,
            updated_at:   Time.current
          }
        end

        return if records.blank?

        MatchNewsItem.upsert_all(
          records,
          unique_by: %i[match_id url]
        )
      end
    end
  end
end
