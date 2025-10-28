class ReportForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  CATEGORIES = %w[question bug report feedback other].freeze

  attribute :post_id, :integer
  attribute :category, :string
  attribute :message, :string
  attribute :email, :string

  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :message, presence: true, length: { maximum: 1000 }
  validates :email,
            allow_blank: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }

  validate :post_must_exist

  def attributes
    super.symbolize_keys
  end

  private

  def post_must_exist
    return if post_id.blank?
    return if Post.exists?(id: post_id)

    errors.add(:post_id, "が見つかりません")
  end
end
