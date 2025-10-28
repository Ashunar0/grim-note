require "test_helper"

class Api::V1::ReportsTest < ActionDispatch::IntegrationTest
  setup do
    @json_headers = { as: :json }
    @original_webhook = ENV["SLACK_REPORT_WEBHOOK_URL"]
    @webhook_url = "https://hooks.slack.com/services/test/webhook"
    ENV["SLACK_REPORT_WEBHOOK_URL"] = @webhook_url
  end

  teardown do
    ENV["SLACK_REPORT_WEBHOOK_URL"] = @original_webhook
  end

  test "通報を送信すると Slack Webhook に転送される" do
    stub_request(:post, @webhook_url).to_return(status: 200, body: "ok")
    post_record = posts(:alice_post)

    post api_v1_reports_path,
         params: {
           post_id: post_record.id,
           category: "report",
           message: "不適切な内容を含んでいます",
           email: "reporter@example.com"
         },
         **@json_headers

    assert_response :success
    json = response.parsed_body
    assert_equal "success", json["status"]
    assert_equal "報告を受け付けました", json.dig("data", "message")
    assert_requested(:post, @webhook_url) do |req|
      body = JSON.parse(req.body)
      assert_includes body["text"], "report"
      assert_includes body["text"], post_record.id.to_s
      assert_includes body["text"], "reporter@example.com"
    end
  end

  test "カテゴリ未指定の場合はバリデーションエラーを返す" do
    post api_v1_reports_path,
         params: {
           message: "内容がありません"
         },
         **@json_headers

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert_equal "error", json["status"]
    assert_equal "VALIDATION_ERROR", json.dig("error", "code")
  end

  test "Webhook 側でエラーが発生した場合は SERVER_ERROR を返す" do
    stub_request(:post, @webhook_url).to_return(status: 500, body: "error")

    post api_v1_reports_path,
         params: {
           category: "bug",
           message: "表示が崩れています"
         },
         **@json_headers

    assert_response :internal_server_error
    json = response.parsed_body
    assert_equal "error", json["status"]
    assert_equal "SERVER_ERROR", json.dig("error", "code")
    assert_equal "送信に失敗しました。時間を置いて再度お試しください。", json.dig("error", "message")
  end
end
