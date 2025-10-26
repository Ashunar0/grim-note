class User < ApplicationRecord
  PASSWORD_MIN_LENGTH = 8

  has_many :posts, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :liked_posts, through: :likes, source: :post

  has_many :given_follows, class_name: "Follow", foreign_key: :follower_id, dependent: :destroy
  has_many :received_follows, class_name: "Follow", foreign_key: :followee_id, dependent: :destroy

  has_many :following_users, through: :given_follows, source: :followee
  has_many :follower_users, through: :received_follows, source: :follower

  attr_reader :password

  before_validation :normalize_email

  validates :name, presence: true, length: { maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password_digest, presence: true
  validate :password_presence, if: -> { password_digest.blank? }
  validate :password_length, if: -> { password.present? }

  def password=(new_password)
    @password = new_password
    return if new_password.blank?

    self.password_digest = PasswordDigest.generate(new_password).to_s
  end

  def authenticate(unencrypted_password)
    return false if password_digest.blank?

    PasswordDigest.valid?(password_digest, unencrypted_password) ? self : false
  end

  private

  def normalize_email
    email&.downcase!
  end

  def password_presence
    errors.add(:password, "を入力してください") if password.blank?
  end

  def password_length
    return if password.length >= PASSWORD_MIN_LENGTH

    errors.add(:password, "は#{PASSWORD_MIN_LENGTH}文字以上で入力してください")
  end
end
