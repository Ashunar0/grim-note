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

ActiveRecord::Schema[7.2].define(version: 2024_10_28_000000) do
  create_table "books", force: :cascade do |t|
    t.string "google_books_id"
    t.string "title", null: false
    t.text "authors"
    t.string "isbn13"
    t.integer "published_year"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["google_books_id"], name: "index_books_on_google_books_id", unique: true
  end

  create_table "follows", id: false, force: :cascade do |t|
    t.integer "follower_id", null: false
    t.integer "followee_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["followee_id", "follower_id"], name: "index_follows_on_followee_id_and_follower_id"
    t.index ["followee_id"], name: "index_follows_on_followee_id"
    t.index ["follower_id", "followee_id"], name: "index_follows_on_follower_id_and_followee_id", unique: true
    t.index ["follower_id"], name: "index_follows_on_follower_id"
  end

  create_table "likes", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_likes_on_post_id"
    t.index ["user_id", "post_id"], name: "index_likes_on_user_id_and_post_id", unique: true
    t.index ["user_id"], name: "index_likes_on_user_id"
  end

  create_table "post_tags", id: false, force: :cascade do |t|
    t.integer "post_id", null: false
    t.integer "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id", "tag_id"], name: "index_post_tags_on_post_id_and_tag_id", unique: true
    t.index ["post_id"], name: "index_post_tags_on_post_id"
    t.index ["tag_id"], name: "index_post_tags_on_tag_id"
  end

  create_table "posts", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "book_id"
    t.string "body", limit: 500, null: false
    t.integer "rating", null: false
    t.date "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["book_id"], name: "index_posts_on_book_id"
    t.index ["created_at"], name: "index_posts_on_created_at"
    t.index ["user_id"], name: "index_posts_on_user_id"
    t.check_constraint "rating BETWEEN 1 AND 5", name: "posts_rating_between_1_and_5"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name", limit: 50, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "name", limit: 50, null: false
    t.text "bio"
    t.string "icon_url"
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "follows", "users", column: "followee_id", on_delete: :cascade
  add_foreign_key "follows", "users", column: "follower_id", on_delete: :cascade
  add_foreign_key "likes", "posts", on_delete: :cascade
  add_foreign_key "likes", "users", on_delete: :cascade
  add_foreign_key "post_tags", "posts", on_delete: :cascade
  add_foreign_key "post_tags", "tags", on_delete: :cascade
  add_foreign_key "posts", "books", on_delete: :nullify
  add_foreign_key "posts", "users", on_delete: :cascade
end
