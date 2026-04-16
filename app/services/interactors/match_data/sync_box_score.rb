module Interactors
  module MatchData
    class SyncBoxScore < Interactors::Base
      expects do
        required(:match).filled(type?: Match)
      end

      def call
        return if box_score_data.blank?

        upsert_box_scores
        upsert_players
      rescue StandardError => e
        log_error "Failed to sync box score for match #{context.match.id}: #{e.message}"
        fail!(e.message)
      end

      private

      def box_score_data
        @box_score_data ||= client.box_score(context.match.external_id)
      end

      def upsert_box_scores
        records = []

        box_score_data.each do |team_data|
          team = team_data['team']
          team_data['players']&.each do |player|
            next if player['id'].blank?

            stats = player['statistics'] || {}
            records << build_record(player, team, stats)
          end
        end

        return if records.blank?

        # Deduplicate by [match_id, player_external_id] — keep last occurrence (most complete data)
        # API sometimes returns same player twice (listed under both teams or duplicated within team)
        deduped = records.reverse.uniq { [ it[:match_id], it[:player_external_id] ] }.reverse

        BoxScore.upsert_all(
          deduped,
          unique_by:   %i[match_id player_external_id],
          update_only: box_score_attributes
        )
      end

      def build_record(player, team, stats)
        {
          match_id:             context.match.id,
          player_external_id:   player['id'],
          player_name:          player['name']&.strip,
          player_full_name:     player['fullName']&.strip,
          player_logo:          player['logo'],
          team_external_id:     team['id'],
          team_name:            team['name'],
          team_logo:            team['logo'],
          shirt_number:         player['shirtNumber'],
          position:             player['position'],
          is_captain:           player['isCaptain'],
          is_substitute:        player['isSubstitute'],
          minutes_played:       player['minutesPlayed'],
          match_rating:         player['matchRating'],
          offsides:             player['offsides'],
          goals_scored:         stats['goalsScored'],
          goals_saved:          stats['goalsSaved'],
          goals_conceded:       stats['goalsConceded'],
          assists:              stats['assists'],
          shots_on_target:      stats['shotsOnTarget'],
          shots_off_target:     stats['shotsOffTarget'],
          shots_total:          stats['shotsTotal'],
          shots_accuracy:       stats['shotsAccuracy'],
          passes_successful:    stats['passesSuccessful'],
          passes_failed:        stats['passesFailed'],
          passes_total:         stats['passesTotal'],
          passes_accuracy:      stats['passesAccuracy'],
          passes_key:           stats['passesKey'],
          tackles_total:        stats['tacklesTotal'],
          interceptions_total:  stats['interceptionsTotal'],
          dribbles_successful:  stats['dribblesSuccessful'],
          dribbles_failed:      stats['dribblesFailed'],
          dribbles_total:       stats['dribblesTotal'],
          dribble_success_rate: stats['dribbleSuccessRate'],
          duels_won:            stats['duelsWon'],
          duels_lost:           stats['duelsLost'],
          duels_total:          stats['duelsTotal'],
          duel_success_rate:    stats['duelSuccessRate'],
          cards_yellow:         stats['cardsYellow'],
          cards_red:            stats['cardsRed'],
          cards_second_yellow:  stats['cardsSecondYellow'],
          fouled_by_others:     stats['fouledByOthers'],
          fouled_others:        stats['fouledOthers'],
          penalties_scored:     stats['penaltiesScored'],
          penalties_missed:     stats['penaltiesMissed'],
          penalties_total:      stats['penaltiesTotal'],
          penalties_accuracy:   stats['penaltiesAccuracy'],
          expected_goals:                      stats['expectedGoals'],
          expected_assists:                    stats['expectedAssists'],
          expected_goals_on_target:            stats['expectedGoalsOnTarget'],
          expected_goals_on_target_conceded:   stats['expectedGoalsOnTargetConceded'],
          expected_goals_prevented:            stats['expectedGoalsPrevented'],
          created_at:           Time.current,
          updated_at:           Time.current
        }
      end

      def box_score_attributes
        %i[
            match_rating minutes_played is_substitute is_captain
            goals_scored goals_saved goals_conceded assists
            shots_on_target shots_off_target shots_total shots_accuracy
            passes_successful passes_failed passes_total passes_accuracy passes_key
            tackles_total interceptions_total
            dribbles_successful dribbles_failed dribbles_total dribble_success_rate
            duels_won duels_lost duels_total duel_success_rate
            cards_yellow cards_red cards_second_yellow
            penalties_scored penalties_missed penalties_total penalties_accuracy
            fouled_by_others fouled_others offsides
            expected_goals expected_assists expected_goals_on_target
            expected_goals_on_target_conceded expected_goals_prevented
          ]
      end

      def upsert_players
        Highlightly::Importers::PlayerImporter.new.call(box_score_data: box_score_data)
      end
    end
  end
end
