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

        Player.upsert_all(
          player_records.uniq { it[:external_id] },
          unique_by:   :external_id,
          update_only: %i[name full_name logo]
        )

        link_box_scores_to_players(player_records.map { it[:external_id] })

        { imported: player_records.size }
      rescue StandardError => e
        log_error "PlayerImporter failed: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end

      private

      def link_box_scores_to_players(external_ids)
        players = Player.where(external_id: external_ids)
                        .pluck(:external_id, :id)
                        .to_h

        BoxScore.where(player_external_id: external_ids, player_id: nil)
                .find_each do |box_score|
                  player_id = players[box_score.player_external_id]
                  box_score.update_column(:player_id, player_id) if player_id
                end
      end
    end
  end
end
