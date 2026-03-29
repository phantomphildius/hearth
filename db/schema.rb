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

ActiveRecord::Schema[8.1].define(version: 2026_03_28_201824) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "activities", force: :cascade do |t|
    t.string "address"
    t.datetime "created_at", null: false
    t.integer "day_of_week"
    t.integer "duration_minutes", null: false
    t.time "end_time", null: false
    t.bigint "household_id", null: false
    t.decimal "latitude", precision: 10, scale: 7
    t.string "location_name"
    t.decimal "longitude", precision: 10, scale: 7
    t.string "name", null: false
    t.text "notes"
    t.string "recurrence", default: "weekly", null: false
    t.time "start_time", null: false
    t.date "starts_on"
    t.datetime "updated_at", null: false
    t.index ["day_of_week"], name: "index_activities_on_day_of_week"
    t.index ["household_id", "day_of_week"], name: "index_activities_on_household_id_and_day_of_week"
    t.index ["household_id"], name: "index_activities_on_household_id"
  end

  create_table "activity_children", force: :cascade do |t|
    t.bigint "activity_id", null: false
    t.bigint "child_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["activity_id", "child_id"], name: "index_activity_children_on_activity_id_and_child_id", unique: true
    t.index ["activity_id"], name: "index_activity_children_on_activity_id"
    t.index ["child_id"], name: "index_activity_children_on_child_id"
  end

  create_table "children", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date_of_birth"
    t.string "first_name"
    t.bigint "household_id", null: false
    t.datetime "updated_at", null: false
    t.index ["household_id"], name: "index_children_on_household_id"
  end

  create_table "household_members", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "household_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["household_id"], name: "index_household_members_on_household_id"
    t.index ["user_id", "household_id"], name: "index_household_members_on_user_id_and_household_id", unique: true
    t.index ["user_id"], name: "index_household_members_on_user_id"
  end

  create_table "households", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name"
    t.string "provider"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true, where: "(provider IS NOT NULL)"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "activities", "households"
  add_foreign_key "activity_children", "activities"
  add_foreign_key "activity_children", "children"
  add_foreign_key "children", "households"
  add_foreign_key "household_members", "households"
  add_foreign_key "household_members", "users"
end
