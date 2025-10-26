class Post < ApplicationRecord
  belongs_to :user
  belongs_to :book, optional: true

  has_many :post_tags, dependent: :destroy
  has_many :tags, through: :post_tags
  has_many :likes, dependent: :destroy
  has_many :liked_users, through: :likes, source: :user

  validates :body, presence: true, length: { maximum: 500 }
  validates :rating, presence: true, inclusion: { in: 1..5 }

  def likes_count
    (self[:likes_count] || likes.size).to_i
  end
end
