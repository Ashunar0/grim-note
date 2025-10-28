require "net/http"

module Reports
  class Dispatcher
    class Error < StandardError; end

    def initialize(report, webhook_url: ENV["SLACK_REPORT_WEBHOOK_URL"], logger: Rails.logger)
      @report = report
      @webhook_url = webhook_url
      @logger = logger
    end

    def deliver!
      raise Error, "Slack webhook URL is not configured" if webhook_url.blank?

      response = Net::HTTP.post(uri, payload.to_json, "Content-Type" => "application/json")
      return if response.is_a?(Net::HTTPSuccess)

      raise Error, "Webhook responded with #{response.code}"
    rescue StandardError => e
      raise Error, e.message
    end

    private

    attr_reader :report, :webhook_url, :logger

    def uri
      @uri ||= URI.parse(webhook_url)
    end

    def payload
      lines = []
      lines << "*カテゴリ*: #{report[:category]}"
      lines << "*投稿ID*: #{report[:post_id]}" if report[:post_id].present?
      lines << "*メール*: #{report[:email]}" if report[:email].present?
      lines << "*メッセージ*:\n#{report[:message]}"

      {
        text: "📬 通報/お問い合わせが届きました\n" + lines.join("\n")
      }
    end
  end
end
