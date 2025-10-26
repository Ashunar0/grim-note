class User < ApplicationRecord
  has_many :posts, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :liked_posts, through: :likes, source: :post

  has_many :given_follows, class_name: "Follow", foreign_key: :follower_id, dependent: :destroy
  has_many :received_follows, class_name: "Follow", foreign_key: :followee_id, dependent: :destroy

  has_many :following_users, through: :given_follows, source: :followee
  has_many :follower_users, through: :received_follows, source: :follower

  before_validation :normalize_email

  validates :name, presence: true, length: { maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :password_digest, presence: true

  private

  def normalize_email
    email&.downcase!
  end
end
