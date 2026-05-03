module Highlightly
  module Importers
    class PlayerImporter < BaseImporter
      def call(box_score_data:)
        return { imported: 0 } if box_score_data.blank?

        player_records = []

        box_score_data.each do |team_data|
          team_data['players']&.each do |player|
            next if player['id'].blank?

            player_records << {
              external_id: player['id'],
              name:        player['name']&.strip,
              full_name:   player['fullName']&.strip,
              logo:        player['logo'],
              created_at:  Time.current,
              updated_at:  Time.current
            }
          end
        end

        return { imported: 0 } if player_records.blank?

        upsert_players(player_records.uniq { it[:external_id] })

        link_box_scores_to_players(player_records.map { it[:external_id] })

        { imported: player_records.size }
      rescue StandardError => e
        log_error "PlayerImporter failed: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end

      private

      def upsert_players(records)
        with_logo, without_logo = records.partition { it[:logo].present? }
        Player.upsert_all(with_logo,    unique_by: :external_id, update_only: %i[name full_name logo]) if with_logo.any?
        Player.upsert_all(without_logo, unique_by: :external_id, update_only: %i[name full_name])      if without_logo.any?
      end

      def link_box_scores_to_players(external_ids)
        players = Player.where(external_id: external_ids)
                        .pluck(:external_id, :id, :logo)
                        .each_with_object({}) { |(ext_id, id, logo), h| h[ext_id] = { id: id, logo: logo } }

        BoxScore.where(player_external_id: external_ids)
                .where('player_id IS NULL OR player_logo IS NULL')
                .find_each do |box_score|
                  player = players[box_score.player_external_id]
                  next unless player

                  updates = {}
                  updates[:player_id]   = player[:id]   if box_score.player_id.nil? && player[:id]
                  updates[:player_logo] = player[:logo] if box_score.player_logo.nil? && player[:logo].present?
                  box_score.update_columns(updates)     if updates.any?
                end
      end
    end
  end
end
