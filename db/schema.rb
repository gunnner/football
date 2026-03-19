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

ActiveRecord::Schema[8.1].define(version: 2026_03_19_192616) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "countries", force: :cascade do |t|
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.string "logo"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_countries_on_code", unique: true
    t.index ["name"], name: "index_countries_on_name"
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

  add_foreign_key "leagues", "countries"
end
