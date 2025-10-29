# frozen_string_literal: true

require "factory_bot_rails"
require "faker"
require "securerandom"

# Faker が日本語を返すようにロケールを指定し、ユニーク値をリセット
Faker::Config.locale = :ja
Faker::UniqueGenerator.clear
FactoryBot.rewind_sequences

USER_COUNT = 10
BOOK_COUNT = 20
POST_COUNT = 50

# FactoryBot の一時的なシード用ファクトリを定義
unless FactoryBot.factories.registered?(:seed_post)
  FactoryBot.define do
    factory :seed_user, class: "User" do
      sequence(:name) { |n| "#{Faker::Name.unique.name[0, 45]}#{n}" }
      sequence(:email) { |n| Faker::Internet.unique.email(name: "seed_user_#{n}", domain: "example.com") }
      bio { Faker::Lorem.paragraph_by_chars(number: 140, supplemental: false) }
      password { "password123" }
    end

    factory :seed_book, class: "Book" do
      sequence(:google_books_id) { |n| "GB#{SecureRandom.hex(6)}#{n}" }
      title { Faker::Book.unique.title }
      authors do
        Array.new(rand(1..3)) { Faker::Book.unique.author }.join("、")
      end
      isbn13 { Faker::Code.unique.isbn(base: 13).tr("-", "") }
      published_year { Faker::Number.between(from: 1945, to: Date.current.year) }
    end

    factory :seed_post, class: "Post" do
      association :user, factory: :seed_user
      association :book, factory: :seed_book
      body do
        Faker::Lorem.paragraph_by_chars(number: rand(100..300), supplemental: true)
      end
      rating { Faker::Number.between(from: 1, to: 5) }
      read_at { Faker::Date.between(from: 2.years.ago, to: Date.current) }
    end
  end
end

ActiveRecord::Base.transaction do
  puts "=== Clearing existing data ==="
  PostTag.delete_all
  Like.delete_all
  Follow.delete_all
  Post.delete_all
  Book.delete_all
  User.delete_all

  puts "=== Generating seed data ==="
  users = FactoryBot.create_list(:seed_user, USER_COUNT)
  books = FactoryBot.create_list(:seed_book, BOOK_COUNT)

  POST_COUNT.times do
    FactoryBot.create(
      :seed_post,
      user: users.sample,
      book: books.sample,
      body: Faker::Lorem.paragraph_by_chars(number: rand(100..300), supplemental: true),
      rating: rand(1..5),
      read_at: Faker::Date.between(from: 2.years.ago, to: Date.current)
    )
  end

  puts "=== Seed generation completed ==="
  puts "Users created: #{User.count}"
  puts "Books created: #{Book.count}"
  puts "Posts created: #{Post.count}"
end
