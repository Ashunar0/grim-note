class Tag < ApplicationRecord
  has_many :post_tags, dependent: :destroy
  has_many :posts, through: :post_tags

  before_validation :normalize_name

  validates :name, presence: true, uniqueness: { case_sensitive: false }, length: { maximum: 50 }

  private

  def normalize_name
    self.name = name.to_s.strip.downcase
  end
end
