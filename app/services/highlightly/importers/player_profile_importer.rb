module Highlightly
  module Importers
    class PlayerProfileImporter < BaseImporter
      BATCH_SIZE       = 50
      REDIS_OFFSET_KEY = 'player_profiles_offset'
      RATE_LIMIT_MAX   = 7000
      # API uses short/common names — map to canonical names stored in teams table
      TEAM_NAME_ALIASES = {
        'Man City'         => 'Manchester City',
        'Man Utd'          => 'Manchester United',
        'Spurs'            => 'Tottenham Hotspur',
        'Wolves'           => 'Wolverhampton Wanderers',
        'West Ham'         => 'West Ham United',
        'Newcastle'        => 'Newcastle United',
        'Leicester'        => 'Leicester City',
        'Brighton'         => 'Brighton & Hove Albion',
        'Nottm Forest'     => 'Nottingham Forest',
        'Sheffield Utd'    => 'Sheffield United',
        'Luton'            => 'Luton Town',
        'QPR'              => 'Queens Park Rangers',
        'PSG'              => 'Paris Saint-Germain',
        'Atleti'           => 'Atlético Madrid',
        'Atletico Madrid'  => 'Atlético Madrid',
        'Barca'            => 'Barcelona',
        'Inter'            => 'Inter Milan',
        'AC Milan'         => 'AC Milan',
        'RB Leipzig'       => 'RB Leipzig',
        'Dortmund'         => 'Borussia Dortmund',
        'Gladbach'         => "Borussia M'Gladbach",
        'Leverkusen'       => 'Bayer Leverkusen',
        'Hoffenheim'       => 'TSG Hoffenheim',
        'Mainz'            => 'Mainz 05',
        'Augsburg'         => 'FC Augsburg',
        'Schalke'          => 'Schalke 04',
        'Porto'            => 'FC Porto',
        'Benfica'          => 'SL Benfica',
        'Sporting CP'      => 'Sporting CP',
        'Ajax'             => 'AFC Ajax',
        'Feyenoord'        => 'Feyenoord',
        'Lyon'             => 'Olympique Lyonnais',
        'Marseille'        => 'Olympique de Marseille',
        'Monaco'           => 'AS Monaco',
        'Roma'             => 'AS Roma',
        'Lazio'            => 'SS Lazio',
        'Napoli'           => 'SSC Napoli',
        'Juventus'         => 'Juventus',
        'Fiorentina'       => 'ACF Fiorentina',
        'Atalanta'         => 'Atalanta BC',
        'Sevilla'          => 'Sevilla FC',
        'Valencia'         => 'Valencia CF',
        'Villarreal'       => 'Villarreal CF',
        'Betis'            => 'Real Betis',
        'Sociedad'         => 'Real Sociedad',
        'Bilbao'           => 'Athletic Bilbao',
        'Osasuna'          => 'CA Osasuna',
        'Getafe'           => 'Getafe CF',
        'Celta Vigo'       => 'Celta de Vigo',
        'Alaves'           => 'Deportivo Alavés'
      }.freeze

      def call
        players = active_league_players
        total   = players.count

        return { imported: 0 } if total.zero?

        offset = RedisService.get(REDIS_OFFSET_KEY).to_i
        offset = 0 if offset >= total

        batch = players.offset(offset).limit(BATCH_SIZE)
        imported = 0

        log "Syncing player profiles: #{batch.size} players (offset #{offset}/#{total})..."

        batch.each do |player|
          break if near_rate_limit?

          data = @client.player(player.external_id)
          next if data.blank?

          upsert_profile(player, data)
          upsert_transfers(player, data)
          upsert_injuries(player, data)
          upsert_rumours(player, data)
          upsert_market_values(player, data)
          update_logo(player, data)

          imported += 1
        rescue Highlightly::RateLimitError => e
          log_error "Rate limit reached after #{imported} players: #{e.message}"
          break
        rescue StandardError => e
          log_error "Failed for player #{player.external_id}: #{e.message}"
          Sentry.capture_exception(e)
        end

        new_offset = offset + batch.size
        new_offset = 0 if new_offset >= total
        RedisService.set(REDIS_OFFSET_KEY, new_offset)

        log "Player profiles synced: #{imported} players, next offset: #{new_offset}"
        { imported: imported }
      rescue StandardError => e
        log_error "PlayerProfileImporter failed: #{e.message}"
        Sentry.capture_exception(e)
        { imported: 0, error: e.message }
      end

      private

      def active_league_players
        Player.in_active_leagues.order(:id)
      end

      def near_rate_limit?
        RedisService.get('requested_attempts').to_i >= RATE_LIMIT_MAX
      end

      def upsert_profile(player, data)
        profile = data['profile']
        return if profile.blank?

        club_data = profile['club'] || {}
        pos_data  = profile['position'] || {}

        record = {
          player_id:           player.id,
          birth_date:          profile['birthDate'],
          birth_place:         profile['birthPlace'],
          citizenship:         profile['citizenship'],
          foot:                profile['foot']&.downcase,
          height:              profile['height'],
          main_position:       pos_data['main'],
          secondary_positions: pos_data['secondary'],
          current_club:        club_data['current'],
          joined_at:           club_data['joinedAt'],
          contract_expiry:     club_data['contractExpiry'],
          created_at:          Time.current,
          updated_at:          Time.current
        }

        PlayerProfile.upsert_all(
          [ record ],
          unique_by: :player_id,
          update_only: %i[
            birth_date birth_place citizenship foot height
            main_position secondary_positions current_club joined_at contract_expiry
          ]
        )
      end

      def resolve_team_name(raw)
        TEAM_NAME_ALIASES[raw] || raw
      end

      def upsert_transfers(player, data)
        transfers = data['transfers']
        return if transfers.blank?

        records = transfers.map do |t|
          {
            player_id:     player.id,
            team_from:     resolve_team_name(t['from']),
            team_to:       resolve_team_name(t['to']),
            transfer_type: t['type'],
            season:        t['season'],
            market_value:  t['marketValue'],
            fee:           t['fee'],
            transfer_date: t['transferDate'],
            created_at:    Time.current,
            updated_at:    Time.current
          }
        end.select { |r| r[:team_from].present? && r[:team_to].present? }

        return if records.blank?

        ApplicationRecord.transaction do
          player.player_transfers.delete_all
          PlayerTransfer.insert_all(records)
        end
      end

      def upsert_injuries(player, data)
        injuries = data['injuries']
        return if injuries.blank?

        records = injuries.map do |inj|
          {
            player_id:            player.id,
            reason:               inj['reason'],
            season:               inj['season'],
            from_date:            inj['fromDate'],
            to_date:              inj['toDate'],
            missed_games:         inj['missedGames'].to_i,
            absent_duration_days: inj['absentDurationInDays'].to_i,
            created_at:           Time.current,
            updated_at:           Time.current
          }
        end.select { |r| r[:reason].present? }

        return if records.blank?

        ApplicationRecord.transaction do
          player.player_injuries.delete_all
          PlayerInjury.insert_all(records)
        end
      end

      def upsert_rumours(player, data)
        rumours = data['rumours']
        return if rumours.blank?

        current    = (rumours['current']    || []).map { |r| build_rumour(player, r, true) }
        historical = (rumours['historical'] || []).map { |r| build_rumour(player, r, false) }
        records    = (current + historical).select { |r| r[:club].present? }

        return if records.blank?

        ApplicationRecord.transaction do
          player.player_rumours.delete_all
          PlayerRumour.insert_all(records)
        end
      end

      def build_rumour(player, r, is_current)
        {
          player_id:            player.id,
          club:                 r['club'],
          rumour_date:          r['rumourDate'],
          transfer_probability: r['transferProbability'],
          is_current:           is_current,
          created_at:           Time.current,
          updated_at:           Time.current
        }
      end

      def upsert_market_values(player, data)
        market_values = data['marketValue']
        return if market_values.blank?

        records = market_values.map do |mv|
          {
            player_id:     player.id,
            recorded_date: mv['recordedDate'],
            value:         mv['value'].to_i,
            currency:      mv['currency'] || '€',
            club:          mv['club'],
            age:           mv['age'],
            created_at:    Time.current,
            updated_at:    Time.current
          }
        end.select { |r| r[:recorded_date].present? && r[:value] > 0 }

        return if records.blank?

        PlayerMarketValue.upsert_all(
          records,
          unique_by: %i[player_id recorded_date],
          update_only: %i[value currency club age]
        )
      end

      def update_logo(player, data)
        return if player.logo.present? || data['logo'].blank?

        player.update!(logo: data['logo'])
      end
    end
  end
end
