# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_09_02_175411) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"



  ## `users`
## column name     | data type | details
## ----------------|-----------|-----------------------
## `id `             | integer   | not null, primary key
## `username  `      | string    | not null, indexed, unique
## `email  `      | string    | not null, indexed, unique
## `password_digest` | string    | not null
## `session_token`   | string    | not null, indexed, unique
## `preferred_name` | string | not null
## `user_role` | string | not null
## `pronunciation ` | string | 
## --- 

  # user = {username: "dan the man", email: "danielmark2525",preferred_name: "daniel", user_role: "king", pronunciation: "d an ule" }
  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "session_token", null: false
    t.string "preferred_name"
    t.string "user_role", null: false
    t.string "pronunciation"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["session_token"], name: "index_users_on_session_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

end