class Book < ApplicationRecord
  has_many :posts, dependent: :nullify

  validates :title, presence: true
  validates :google_books_id, uniqueness: true, allow_nil: true
  validates :isbn13, length: { maximum: 20 }, allow_nil: true
end
