require "uri"
require "net/http"
require "json"
require "open-uri"

module GoogleBooks
  class SearchService
    class Error < StandardError; end

    GOOGLE_BOOKS_ENDPOINT = URI("https://www.googleapis.com/books/v1/volumes")
    MAX_RESULTS = 10
    OPEN_TIMEOUT_SECONDS = 3
    READ_TIMEOUT_SECONDS = 5
    TITLE_FALLBACK = "タイトル不明"
    AUTHORS_FALLBACK = "著者不明"

    def self.call(query)
      new(query).call
    end

    def initialize(query)
      @query = query.to_s.strip
    end

    def call
      body_text, status = fetch_response_body
      unless status.to_i == 200
        raise Error, "Google Books API responded with #{status}"
      end

      body = JSON.parse(body_text)
      items = Array(body["items"])
      items.map { |item| normalize_item(item) }
    rescue JSON::ParserError => e
      raise Error, "Failed to parse Google Books API response: #{e.message}", cause: e
    rescue StandardError => e
      raise Error.new(e.message), cause: e
    end

    private

    def fetch_response_body
      uri = build_uri
      Rails.logger.info("[GoogleBooks] env=#{Rails.env}")
      return fetch_with_open_uri(uri) if relaxed_ssl_environment?

      response = perform_http_request(uri)
      [response.body, response.code]
    rescue OpenSSL::SSL::SSLError => e
      Rails.logger.error("[GoogleBooks] SSL error #{e.class}: #{e.message}")
      handle_ssl_error!(e, uri)
    end

    def fetch_with_open_uri(uri)
      unless relaxed_ssl_environment?
        raise Error.new("SSL fallback is restricted to development/test environments")
      end

      Rails.logger.info("[GoogleBooks] fetching via open-uri")
      io = URI.open(uri, ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE)
      [io.read, 200]
    rescue OpenURI::HTTPError => e
      Rails.logger.info("[GoogleBooks] open-uri error: #{e.message}")
      [e.io.read, Array(e.io.status).first]
    end

    def perform_http_request(uri)
      request = Net::HTTP::Get.new(uri)

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.open_timeout = OPEN_TIMEOUT_SECONDS
      http.read_timeout = READ_TIMEOUT_SECONDS
      configure_ssl!(http)

      http.start do |client|
        client.request(request)
      end
    end

    def configure_ssl!(http)
      return unless http.use_ssl?

      Rails.logger.info("[GoogleBooks] configuring SSL...")
      context = http.instance_variable_get(:@ssl_context) || OpenSSL::SSL::SSLContext.new

      if Rails.env.development?
        context.verify_mode = OpenSSL::SSL::VERIFY_NONE
        context.verify_hostname = false
        context.verify_flags = 0 if context.respond_to?(:verify_flags=)
        Rails.logger.info("[GoogleBooks] SSL verify_mode=VERIFY_NONE (development)")
      else
        context.verify_mode = OpenSSL::SSL::VERIFY_PEER
        context.verify_hostname = true
        context.verify_flags = 0 if context.respond_to?(:verify_flags=)
        Rails.logger.info("[GoogleBooks] SSL verify_mode=VERIFY_PEER")
      end

      http.instance_variable_set(:@ssl_context, context)
    end

    def handle_ssl_error!(error, uri)
      if relaxed_ssl_environment?
        Rails.logger.warn("[GoogleBooks] Retrying with VERIFY_NONE (development)")
        fetch_with_open_uri(uri)
      else
        raise Error.new("Failed to establish SSL connection to Google Books API. Check SSL_CERT_FILE / SSL_CERT_DIR settings."), cause: error
      end
    end

    def build_uri
      uri = GOOGLE_BOOKS_ENDPOINT.dup
      params = {
        q: @query,
        maxResults: MAX_RESULTS
      }
      api_key = ENV["GOOGLE_BOOKS_API_KEY"].presence
      params[:key] = api_key if api_key
      uri.query = URI.encode_www_form(params)
      uri
    end

    def normalize_item(item)
      info = item["volumeInfo"] || {}
      {
        google_books_id: item["id"],
        title: normalized_title(info),
        authors: normalized_authors(info),
        isbn13: extract_isbn13(info),
        published_year: extract_published_year(info)
      }
    end

    def normalized_title(info)
      title = info["title"].to_s.strip
      return title if title.present?

      subtitle = info["subtitle"].to_s.strip
      return subtitle if subtitle.present?

      TITLE_FALLBACK
    end

    def normalized_authors(info)
      authors = Array(info["authors"]).map { |name| name.to_s.strip }.reject(&:blank?)
      return authors.join(", ") if authors.any?

      AUTHORS_FALLBACK
    end

    def extract_isbn13(info)
      identifiers = Array(info["industryIdentifiers"])
      match = identifiers.find { |identifier| identifier["type"] == "ISBN_13" && identifier["identifier"].present? }
      match && match["identifier"]
    end

    def extract_published_year(info)
      published_date = info["publishedDate"].to_s
      return if published_date.blank?

      if published_date =~ /\A(\d{4})/
        Regexp.last_match(1).to_i
      end
    end

    def relaxed_ssl_environment?
      Rails.env.development? || Rails.env.test?
    end
  end
end
