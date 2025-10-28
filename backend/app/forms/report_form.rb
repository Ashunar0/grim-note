class ReportForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  CATEGORIES = %w[question bug report feedback other].freeze

  attribute :post_id, :integer
  attribute :category, :string
  attribute :message, :string
  attribute :email, :string

  validates :category, presence: true, inclusion: { in: CATEGORIES }

  validate :validate_message
  validate :validate_email
  validate :post_must_exist

  def attributes
    super.symbolize_keys
  end

  private

  def validate_message
    if message.blank?
      errors.add(:base, "お問い合わせ内容を入力してください")
    elsif message.length > 1000
      errors.add(:base, "お問い合わせ内容は1000文字以内で入力してください")
    end
  end

  def validate_email
    if email.blank?
      errors.add(:base, "メールアドレスを入力してください")
    elsif email !~ URI::MailTo::EMAIL_REGEXP
      errors.add(:base, "メールアドレスが不正です")
    end
  end

  def post_must_exist
    return if post_id.blank?
    return if Post.exists?(id: post_id)

    errors.add(:base, "投稿が見つかりません")
  end
end
