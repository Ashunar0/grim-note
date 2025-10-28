require "test_helper"

class ReportFormTest < ActiveSupport::TestCase
  test "valid with all required attributes" do
    form = ReportForm.new(category: "report", message: "内容", email: "user@example.com")

    assert form.valid?
  end

  test "email is required" do
    form = ReportForm.new(category: "report", message: "内容")

    refute form.valid?
    assert_includes form.errors.full_messages, "メールアドレスを入力してください"
  end

  test "message must be within 1000 characters" do
    form = ReportForm.new(category: "report", message: "a" * 1000, email: "user@example.com")

    assert form.valid?

    form.message = "a" * 1001
    refute form.valid?
    assert_includes form.errors.full_messages, "お問い合わせ内容は1000文字以内で入力してください"
  end
end
