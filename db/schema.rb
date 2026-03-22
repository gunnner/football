# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_22_055615) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "box_scores", force: :cascade do |t|
    t.integer "assists", default: 0
    t.integer "cards_red", default: 0
    t.integer "cards_second_yellow", default: 0
    t.integer "cards_yellow", default: 0
    t.datetime "created_at", null: false
    t.string "dribble_success_rate"
    t.integer "dribbles_failed", default: 0
    t.integer "dribbles_successful", default: 0
    t.integer "dribbles_total", default: 0
    t.string "duel_success_rate"
    t.integer "duels_lost", default: 0
    t.integer "duels_total", default: 0
    t.integer "duels_won", default: 0
    t.float "expected_assists"
    t.float "expected_goals"
    t.float "expected_goals_on_target"
    t.float "expected_goals_on_target_conceded"
    t.float "expected_goals_prevented"
    t.integer "fouled_by_others", default: 0
    t.integer "fouled_others", default: 0
    t.integer "goals_conceded", default: 0
    t.integer "goals_saved", default: 0
    t.integer "goals_scored", default: 0
    t.integer "interceptions_total", default: 0
    t.boolean "is_captain", default: false
    t.boolean "is_substitute", default: false
    t.bigint "match_id", null: false
    t.string "match_rating"
    t.integer "minutes_played"
    t.integer "offsides"
    t.string "passes_accuracy"
    t.integer "passes_failed", default: 0
    t.integer "passes_key", default: 0
    t.integer "passes_successful", default: 0
    t.integer "passes_total", default: 0
    t.string "penalties_accuracy"
    t.integer "penalties_missed", default: 0
    t.integer "penalties_scored", default: 0
    t.integer "penalties_total", default: 0
    t.bigint "player_external_id"
    t.string "player_full_name"
    t.string "player_logo"
    t.string "player_name"
    t.string "position"
    t.integer "shirt_number"
    t.string "shots_accuracy"
    t.integer "shots_off_target", default: 0
    t.integer "shots_on_target", default: 0
    t.integer "shots_total", default: 0
    t.integer "tackles_total", default: 0
    t.bigint "team_external_id", null: false
    t.string "team_logo"
    t.string "team_name"
    t.datetime "updated_at", null: false
    t.index ["match_id", "player_external_id"], name: "index_box_scores_on_match_id_and_player_external_id"
    t.index ["match_id", "team_external_id"], name: "index_box_scores_on_match_id_and_team_external_id"
    t.index ["match_id"], name: "index_box_scores_on_match_id"
  end

  create_table "countries", force: :cascade do |t|
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.string "logo"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_countries_on_code", unique: true
    t.index ["name"], name: "index_countries_on_name"
  end

  create_table "highlights", force: :cascade do |t|
    t.string "channel"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "embed_url"
    t.bigint "external_id", null: false
    t.string "highlight_type", null: false
    t.string "img_url"
    t.bigint "match_id", null: false
    t.string "source"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.string "url", null: false
    t.index ["external_id"], name: "index_highlights_on_external_id", unique: true
    t.index ["highlight_type"], name: "index_highlights_on_highlight_type"
    t.index ["match_id"], name: "index_highlights_on_match_id"
  end

  create_table "leagues", force: :cascade do |t|
    t.bigint "country_id", null: false
    t.datetime "created_at", null: false
    t.bigint "external_id", null: false
    t.string "logo"
    t.string "name", null: false
    t.integer "seasons", default: [], array: true
    t.datetime "updated_at", null: false
    t.index ["country_id"], name: "index_leagues_on_country_id"
    t.index ["external_id"], name: "index_leagues_on_external_id", unique: true
    t.index ["name"], name: "index_leagues_on_name"
    t.index ["seasons"], name: "index_leagues_on_seasons", using: :gin
  end

  create_table "match_events", force: :cascade do |t|
    t.bigint "assisting_player_external_id"
    t.string "assisting_player_name"
    t.datetime "created_at", null: false
    t.bigint "match_id", null: false
    t.bigint "player_external_id"
    t.string "player_name"
    t.string "substituted_player"
    t.bigint "team_external_id"
    t.string "team_logo"
    t.string "team_name"
    t.string "time", null: false
    t.string "type", null: false
    t.datetime "updated_at", null: false
    t.index ["match_id", "time", "type", "player_external_id"], name: "index_match_events_unique", unique: true
    t.index ["match_id", "time"], name: "index_match_events_on_match_id_and_time"
    t.index ["match_id"], name: "index_match_events_on_match_id"
    t.index ["type"], name: "index_match_events_on_type"
  end

  create_table "match_lineups", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "formation"
    t.jsonb "initial_lineup", default: []
    t.bigint "match_id", null: false
    t.jsonb "substitutes", default: []
    t.bigint "team_external_id", null: false
    t.string "team_logo"
    t.string "team_name"
    t.datetime "updated_at", null: false
    t.index ["initial_lineup"], name: "index_match_lineups_on_initial_lineup", using: :gin
    t.index ["match_id", "team_external_id"], name: "index_match_lineups_on_match_id_and_team_external_id", unique: true
    t.index ["match_id"], name: "index_match_lineups_on_match_id"
    t.index ["substitutes"], name: "index_match_lineups_on_substitutes", using: :gin
  end

  create_table "match_statistics", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "display_name", null: false
    t.bigint "match_id", null: false
    t.bigint "team_external_id"
    t.string "team_logo"
    t.string "team_name"
    t.datetime "updated_at", null: false
    t.float "value"
    t.index ["match_id", "team_external_id", "display_name"], name: "index_match_statistics_unique", unique: true
    t.index ["match_id", "team_external_id"], name: "index_match_statistics_on_match_id_and_team_external_id"
    t.index ["match_id"], name: "index_match_statistics_on_match_id"
  end

  create_table "matches", force: :cascade do |t|
    t.bigint "away_team_id", null: false
    t.integer "clock"
    t.datetime "created_at", null: false
    t.datetime "date", null: false
    t.bigint "external_id", null: false
    t.string "forecast_status"
    t.string "forecast_temperature"
    t.bigint "home_team_id", null: false
    t.bigint "league_id", null: false
    t.string "referee_name"
    t.string "referee_nationality"
    t.string "round"
    t.string "score_current"
    t.string "score_penalties"
    t.string "status", default: "Not started", null: false
    t.datetime "updated_at", null: false
    t.integer "venue_capacity"
    t.string "venue_city"
    t.string "venue_country"
    t.string "venue_name"
    t.index ["away_team_id"], name: "index_matches_on_away_team_id"
    t.index ["date"], name: "index_matches_on_date"
    t.index ["external_id"], name: "index_matches_on_external_id", unique: true
    t.index ["home_team_id", "away_team_id"], name: "index_matches_on_home_team_id_and_away_team_id"
    t.index ["home_team_id"], name: "index_matches_on_home_team_id"
    t.index ["league_id", "date"], name: "index_matches_on_league_id_and_date"
    t.index ["league_id"], name: "index_matches_on_league_id"
    t.index ["status"], name: "index_matches_on_status"
  end

  create_table "player_injuries", force: :cascade do |t|
    t.integer "absent_duration_days", default: 0
    t.datetime "created_at", null: false
    t.string "from_date"
    t.integer "missed_games", default: 0
    t.bigint "player_id", null: false
    t.string "reason", null: false
    t.string "season"
    t.string "to_date"
    t.datetime "updated_at", null: false
    t.index ["player_id", "from_date"], name: "index_player_injuries_on_player_id_and_from_date"
    t.index ["player_id"], name: "index_player_injuries_on_player_id"
  end

  create_table "player_market_values", force: :cascade do |t|
    t.integer "age"
    t.string "club"
    t.datetime "created_at", null: false
    t.string "currency", default: "€", null: false
    t.bigint "player_id", null: false
    t.date "recorded_date", null: false
    t.datetime "updated_at", null: false
    t.bigint "value", null: false
    t.index ["player_id", "recorded_date"], name: "index_player_market_values_on_player_id_and_recorded_date"
    t.index ["player_id"], name: "index_player_market_values_on_player_id"
  end

  create_table "player_profiles", force: :cascade do |t|
    t.string "birth_date"
    t.string "birth_place"
    t.string "citizenship"
    t.string "contract_expiry"
    t.datetime "created_at", null: false
    t.string "current_club"
    t.string "foot"
    t.string "height"
    t.string "joined_at"
    t.string "main_position"
    t.bigint "player_id", null: false
    t.string "secondary_positions"
    t.datetime "updated_at", null: false
    t.index ["player_id"], name: "index_player_profiles_on_player_id"
  end

  create_table "player_rumours", force: :cascade do |t|
    t.string "club", null: false
    t.datetime "created_at", null: false
    t.boolean "is_current", default: false, null: false
    t.bigint "player_id", null: false
    t.string "rumour_date"
    t.string "transfer_probability"
    t.datetime "updated_at", null: false
    t.index ["player_id", "is_current"], name: "index_player_rumours_on_player_id_and_is_current"
    t.index ["player_id"], name: "index_player_rumours_on_player_id"
  end

  create_table "player_statistics", force: :cascade do |t|
    t.integer "assists", default: 0
    t.integer "clean_sheets", default: 0
    t.string "club", null: false
    t.string "competition_type"
    t.datetime "created_at", null: false
    t.integer "games_played", default: 0
    t.integer "goals", default: 0
    t.integer "goals_conceded", default: 0
    t.string "league"
    t.integer "minutes_played", default: 0
    t.integer "own_goals", default: 0
    t.integer "penalties_scored", default: 0
    t.bigint "player_id", null: false
    t.integer "red_cards", default: 0
    t.string "season"
    t.integer "second_yellow_cards", default: 0
    t.integer "substituted_in", default: 0
    t.integer "substituted_out", default: 0
    t.datetime "updated_at", null: false
    t.integer "yellow_cards", default: 0
    t.index ["player_id", "club", "season", "competition_type"], name: "index_player_stats_unique", unique: true
    t.index ["player_id", "season"], name: "index_player_statistics_on_player_id_and_season"
    t.index ["player_id"], name: "index_player_statistics_on_player_id"
  end

  create_table "player_transfers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "fee"
    t.string "market_value"
    t.bigint "player_id", null: false
    t.string "season"
    t.string "team_from", null: false
    t.string "team_to", null: false
    t.string "transfer_date"
    t.string "transfer_type"
    t.datetime "updated_at", null: false
    t.index ["player_id", "transfer_date"], name: "index_player_transfers_on_player_id_and_transfer_date"
    t.index ["player_id"], name: "index_player_transfers_on_player_id"
  end

  create_table "players", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "external_id", null: false
    t.string "full_name"
    t.string "logo"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["external_id"], name: "index_players_on_external_id", unique: true
    t.index ["name"], name: "index_players_on_name"
  end

  create_table "standings", force: :cascade do |t|
    t.integer "away_draws", default: 0
    t.integer "away_loses", default: 0
    t.integer "away_played", default: 0
    t.integer "away_wins", default: 0
    t.datetime "created_at", null: false
    t.integer "draws", default: 0
    t.integer "games_played", default: 0
    t.string "group_name"
    t.integer "home_draws", default: 0
    t.integer "home_loses", default: 0
    t.integer "home_played", default: 0
    t.integer "home_wins", default: 0
    t.bigint "league_id", null: false
    t.integer "loses", default: 0
    t.integer "points", default: 0, null: false
    t.integer "position", null: false
    t.integer "received_goals", default: 0
    t.integer "scored_goals", default: 0
    t.integer "season", null: false
    t.bigint "team_id", null: false
    t.datetime "updated_at", null: false
    t.integer "wins", default: 0
    t.index ["league_id", "season", "team_id"], name: "index_standings_on_league_id_and_season_and_team_id", unique: true
    t.index ["league_id", "season"], name: "index_standings_on_league_id_and_season"
    t.index ["league_id"], name: "index_standings_on_league_id"
    t.index ["position"], name: "index_standings_on_position"
    t.index ["team_id"], name: "index_standings_on_team_id"
  end

  create_table "team_statistics", force: :cascade do |t|
    t.integer "away_draws", default: 0
    t.integer "away_loses", default: 0
    t.integer "away_played", default: 0
    t.integer "away_received", default: 0
    t.integer "away_scored", default: 0
    t.integer "away_wins", default: 0
    t.datetime "created_at", null: false
    t.integer "home_draws", default: 0
    t.integer "home_loses", default: 0
    t.integer "home_played", default: 0
    t.integer "home_received", default: 0
    t.integer "home_scored", default: 0
    t.integer "home_wins", default: 0
    t.bigint "league_external_id"
    t.string "league_name"
    t.integer "season", null: false
    t.bigint "team_id", null: false
    t.integer "total_draws", default: 0
    t.integer "total_loses", default: 0
    t.integer "total_played", default: 0
    t.integer "total_received", default: 0
    t.integer "total_scored", default: 0
    t.integer "total_wins", default: 0
    t.datetime "updated_at", null: false
    t.index ["team_id", "season", "league_external_id"], name: "index_team_stats_unique", unique: true
    t.index ["team_id"], name: "index_team_statistics_on_team_id"
  end

  create_table "teams", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "external_id", null: false
    t.string "logo"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["external_id"], name: "index_teams_on_external_id", unique: true
    t.index ["name"], name: "index_teams_on_name"
  end

  add_foreign_key "box_scores", "matches"
  add_foreign_key "highlights", "matches"
  add_foreign_key "leagues", "countries"
  add_foreign_key "match_events", "matches"
  add_foreign_key "match_lineups", "matches"
  add_foreign_key "match_statistics", "matches"
  add_foreign_key "matches", "leagues"
  add_foreign_key "matches", "teams", column: "away_team_id"
  add_foreign_key "matches", "teams", column: "home_team_id"
  add_foreign_key "player_injuries", "players"
  add_foreign_key "player_market_values", "players"
  add_foreign_key "player_profiles", "players"
  add_foreign_key "player_rumours", "players"
  add_foreign_key "player_statistics", "players"
  add_foreign_key "player_transfers", "players"
  add_foreign_key "standings", "leagues"
  add_foreign_key "standings", "teams"
  add_foreign_key "team_statistics", "teams"
end
