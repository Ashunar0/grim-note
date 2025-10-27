require "uri"
require "net/http"
require "json"

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
      response = perform_request
      unless response.is_a?(Net::HTTPSuccess)
        raise Error, "Google Books API responded with #{response.code}"
      end

      body = JSON.parse(response.body)
      items = Array(body["items"])
      items.map { |item| normalize_item(item) }
    rescue JSON::ParserError => e
      raise Error, "Failed to parse Google Books API response: #{e.message}", cause: e
    rescue StandardError => e
      raise Error.new(e.message), cause: e
    end

    private

    def perform_request
      uri = build_uri
      request = Net::HTTP::Get.new(uri)

      Net::HTTP.start(
        uri.host,
        uri.port,
        use_ssl: uri.scheme == "https",
        open_timeout: OPEN_TIMEOUT_SECONDS,
        read_timeout: READ_TIMEOUT_SECONDS
      ) do |http|
        http.request(request)
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
  end
end
