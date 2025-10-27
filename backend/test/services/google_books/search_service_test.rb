require "test_helper"

class GoogleBooksSearchServiceTest < ActiveSupport::TestCase
  setup do
    @previous_api_key = ENV["GOOGLE_BOOKS_API_KEY"]
    ENV["GOOGLE_BOOKS_API_KEY"] = nil
  end

  teardown do
    ENV["GOOGLE_BOOKS_API_KEY"] = @previous_api_key
  end

  test "外部APIレスポンスを正規化して返す" do
    stub_request(:get, "https://www.googleapis.com/books/v1/volumes")
      .with(query: hash_including("q" => "harry", "maxResults" => "10"))
      .to_return(
        status: 200,
        body: {
          items: [
            {
              id: "book-123",
              volumeInfo: {
                title: "Harry Potter",
                authors: ["J. K. Rowling", "John Doe"],
                publishedDate: "1997-06-26",
                industryIdentifiers: [
                  { "type" => "ISBN_13", "identifier" => "9780747532699" }
                ]
              }
            }
          ]
        }.to_json,
        headers: { "Content-Type" => "application/json" }
      )

    results = GoogleBooks::SearchService.call("harry")
    assert_equal 1, results.size

    book = results.first
    assert_equal "book-123", book[:google_books_id]
    assert_equal "Harry Potter", book[:title]
    assert_equal "J. K. Rowling, John Doe", book[:authors]
    assert_equal "9780747532699", book[:isbn13]
    assert_equal 1997, book[:published_year]
  end

  test "欠損値をフォールバックし、エラー時はcauseを保持する" do
    stub_request(:get, "https://www.googleapis.com/books/v1/volumes")
      .with(query: hash_including("q" => "missing", "maxResults" => "10"))
      .to_return(
        status: 200,
        body: {
          items: [
            {
              id: "book-456",
              volumeInfo: {
                subtitle: "Unknown Subtitle",
                authors: [],
                publishedDate: "",
                industryIdentifiers: []
              }
            }
          ]
        }.to_json,
        headers: { "Content-Type" => "application/json" }
      )

    books = GoogleBooks::SearchService.call("missing")
    book = books.first
    assert_equal "Unknown Subtitle", book[:title]
    assert_equal "著者不明", book[:authors]
    assert_nil book[:isbn13]
    assert_nil book[:published_year]

    stub_request(:get, "https://www.googleapis.com/books/v1/volumes")
      .with(query: hash_including("q" => "timeout", "maxResults" => "10"))
      .to_timeout

    error = assert_raises(GoogleBooks::SearchService::Error) do
      GoogleBooks::SearchService.call("timeout")
    end
    assert_kind_of Net::OpenTimeout, error.cause
  end
end
