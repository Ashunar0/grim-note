class CreateInitialSchema < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :name, null: false, limit: 50
      t.text :bio
      t.string :icon_url
      t.string :email, null: false
      t.string :password_digest, null: false

      t.timestamps
    end
    add_index :users, :email, unique: true

    create_table :books do |t|
      t.string :google_books_id
      t.string :title, null: false
      t.text :authors
      t.string :isbn13
      t.integer :published_year

      t.timestamps
    end
    add_index :books, :google_books_id, unique: true

    create_table :posts do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :book, null: true, foreign_key: { on_delete: :nullify }
      t.string :body, null: false, limit: 500
      t.integer :rating, null: false
      t.date :read_at

      t.timestamps
    end
    add_index :posts, :created_at
    add_check_constraint :posts, "rating BETWEEN 1 AND 5", name: "posts_rating_between_1_and_5"

    create_table :tags do |t|
      t.string :name, null: false, limit: 50

      t.timestamps
    end
    add_index :tags, :name, unique: true

    create_table :post_tags, id: false do |t|
      t.references :post, null: false, foreign_key: { on_delete: :cascade }
      t.references :tag, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
    add_index :post_tags, [:post_id, :tag_id], unique: true

    create_table :likes do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :post, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
    add_index :likes, [:user_id, :post_id], unique: true

    create_table :follows, id: false do |t|
      t.references :follower, null: false, foreign_key: { to_table: :users, on_delete: :cascade }
      t.references :followee, null: false, foreign_key: { to_table: :users, on_delete: :cascade }

      t.timestamps
    end
    add_index :follows, [:follower_id, :followee_id], unique: true
    add_index :follows, [:followee_id, :follower_id]
  end
end
