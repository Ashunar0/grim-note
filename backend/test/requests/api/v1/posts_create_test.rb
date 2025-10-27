require "test_helper"

class Api::V1::PostsCreateTest < ActionDispatch::IntegrationTest
  setup do
    @json_headers = { as: :json }
  end

  test "認証なしでは投稿できない" do
    post api_v1_posts_path, params: {}, **@json_headers

    assert_response :unauthorized
    json = response.parsed_body
    assert_equal "UNAUTHORIZED", json.dig("error", "code")
  end

  test "既存書籍とタグを紐付けて投稿を作成する" do
    login_as(users(:alice))

    assert_difference -> { Post.count }, 1 do
      assert_difference -> { Tag.count }, 1 do
        assert_difference -> { PostTag.count }, 2 do
          post api_v1_posts_path,
               params: {
                 book_id: books(:norwegian_wood).id,
                 body: "A brand new reflection.",
                 rating: 5,
                 read_at: "2025-01-01",
                 tags: [" Mythology ", "Philosophy", "MYTHOLOGY"]
               },
               **@json_headers
        end
      end
    end

    assert_response :created
    json = response.parsed_body
    assert_equal "success", json["status"]
    post_data = json["data"]
    assert_equal "A brand new reflection.", post_data["body"]
    assert_equal books(:norwegian_wood).id, post_data["book_id"]
    tag_names = post_data["tags"]
    assert_includes tag_names, "mythology"
    assert_includes tag_names, "philosophy"
    assert_equal 2, tag_names.uniq.size
  end

  test "書籍情報を指定して新規書籍を作成する" do
    login_as(users(:alice))

    assert_difference -> { Book.count }, 1 do
      post api_v1_posts_path,
           params: {
             body: "Manual book entry",
             rating: 4,
             tags: ["Essay"],
             book: {
               google_books_id: "new-gb-id",
               title: "Custom Title",
               authors: "Jane Doe",
               isbn13: "9781234567897",
               published_year: 2024
             }
           },
           **@json_headers
    end

    assert_response :created
    created_book = Book.find_by(google_books_id: "new-gb-id")
    json = response.parsed_body
    post_data = json["data"]
    assert_equal created_book.id, post_data["book_id"]
    assert_equal ["essay"], post_data["tags"]
    assert_equal "9781234567897", created_book.isbn13
  end

  test "同一GoogleBooksIDの場合は既存書籍を更新して再利用する" do
    existing = books(:norwegian_wood)
    existing.update!(authors: nil)
    login_as(users(:alice))

    post api_v1_posts_path,
         params: {
           body: "Update book info",
           rating: 3,
           book: {
             google_books_id: existing.google_books_id,
             title: existing.title,
             authors: "Haruki Murakami",
             published_year: 1988
           }
         },
         **@json_headers

    assert_response :created
    json = response.parsed_body
    post_data = json["data"]
    assert_equal existing.id, post_data["book_id"]

    existing.reload
    assert_equal "Haruki Murakami", existing.authors
    assert_equal 1988, existing.published_year
  end

  test "published_year が数値でない場合はバリデーションエラーを返す" do
    login_as(users(:alice))

    post api_v1_posts_path,
         params: {
           body: "Invalid year",
           rating: 3,
           book: {
             title: "Yearless Book",
             published_year: "twentytwenty"
           }
         },
         **@json_headers

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert_equal "VALIDATION_ERROR", json.dig("error", "code")
  end

  test "本文未入力の場合はバリデーションエラーを返す" do
    login_as(users(:alice))

    post api_v1_posts_path,
         params: {
           rating: 5,
           tags: ["Blank"]
         },
         **@json_headers

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert_equal "VALIDATION_ERROR", json.dig("error", "code")
  end

  private

  def login_as(user)
    post api_v1_login_path,
         params: {
           email: user.email,
           password: "password123"
         },
         **@json_headers
    assert_response :success
  end
end
