require "test_helper"
require "stringio"

class Api::V1::BooksSearchTest < ActionDispatch::IntegrationTest
  setup do
    @json_headers = { as: :json }
    @previous_api_key = ENV["GOOGLE_BOOKS_API_KEY"]
    ENV["GOOGLE_BOOKS_API_KEY"] = "test-api-key"
  end

  teardown do
    ENV["GOOGLE_BOOKS_API_KEY"] = @previous_api_key
  end

  test "認証なしでは401を返す" do
    get api_v1_books_search_path, **@json_headers

    assert_response :unauthorized
    json = response.parsed_body
    assert_equal "UNAUTHORIZED", json.dig("error", "code")
  end

  test "qパラメータが必須" do
    login_as_alice

    get api_v1_books_search_path, **@json_headers

    assert_response :bad_request
    json = response.parsed_body
    assert_equal "VALIDATION_ERROR", json.dig("error", "code")
  end

  test "書籍検索が成功し結果を返す" do
    login_as_alice
    stub_request(:get, "https://www.googleapis.com/books/v1/volumes")
      .with(query: hash_including("q" => "吾輩は猫である", "maxResults" => "10", "key" => "test-api-key"))
      .to_return(
        status: 200,
        body: {
          items: [
            {
              id: "book-id-1",
              volumeInfo: {
                title: "吾輩は猫である",
                authors: ["夏目漱石"],
                publishedDate: "1905-01-01",
                industryIdentifiers: [
                  { "type" => "ISBN_13", "identifier" => "9781234567890" }
                ]
              }
            },
            {
              id: "book-id-2",
              volumeInfo: {
                subtitle: "不明な書籍",
                industryIdentifiers: []
              }
            }
          ]
        }.to_json,
        headers: { "Content-Type" => "application/json" }
      )

    get api_v1_books_search_path(q: "吾輩は猫である"), **@json_headers

    assert_response :success
    json = response.parsed_body
    assert_equal "success", json["status"]
    first, second = json["data"]
    assert_equal "book-id-1", first["google_books_id"]
    assert_equal "吾輩は猫である", first["title"]
    assert_equal "夏目漱石", first["authors"]
    assert_equal "9781234567890", first["isbn13"]
    assert_equal 1905, first["published_year"]

    assert_equal "book-id-2", second["google_books_id"]
    assert_equal "不明な書籍", second["title"]
    assert_equal "著者不明", second["authors"]
    assert_nil second["isbn13"]
    assert_nil second["published_year"]
  end

  test "書籍が0件の場合は空配列を返す" do
    login_as_alice
    stub_request(:get, "https://www.googleapis.com/books/v1/volumes")
      .with(query: hash_including("q" => "unknown", "maxResults" => "10", "key" => "test-api-key"))
      .to_return(status: 200, body: { items: [] }.to_json, headers: { "Content-Type" => "application/json" })

    get api_v1_books_search_path(q: "unknown"), **@json_headers

    assert_response :success
    json = response.parsed_body
    assert_equal [], json["data"]
  end

  test "外部APIエラー時はSERVER_ERRORを返す" do
    login_as_alice
    stub_request(:get, "https://www.googleapis.com/books/v1/volumes")
      .with(query: hash_including("q" => "broken", "maxResults" => "10", "key" => "test-api-key"))
      .to_return(status: 500, body: "")

    get api_v1_books_search_path(q: "broken"), **@json_headers

    assert_response :internal_server_error
    json = response.parsed_body
    assert_equal "SERVER_ERROR", json.dig("error", "code")
  end

  test "レート制限時もSERVER_ERRORを返しログ出力する" do
    login_as_alice
    stub_request(:get, "https://www.googleapis.com/books/v1/volumes")
      .with(query: hash_including("q" => "ratelimit", "maxResults" => "10", "key" => "test-api-key"))
      .to_return(status: 429, body: {
        error: {
          code: 429,
          message: "Rate limit exceeded"
        }
      }.to_json, headers: { "Content-Type" => "application/json" })

    log_output = StringIO.new
    broadcast_logger = ActiveSupport::Logger.new(log_output)
    Rails.logger.broadcasts << broadcast_logger

    begin
      get api_v1_books_search_path(q: "ratelimit"), **@json_headers
    ensure
      Rails.logger.broadcasts.delete(broadcast_logger)
      broadcast_logger.close
    end

    assert_includes log_output.string, "GoogleBooks"
    assert_response :internal_server_error
    json = response.parsed_body
    assert_equal "SERVER_ERROR", json.dig("error", "code")
  end

  private

  def login_as_alice
    post api_v1_login_path, params: { email: users(:alice).email, password: "password123" }, **@json_headers
    assert_response :success
  end
end
