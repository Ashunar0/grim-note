require "test_helper"

class Api::V1::PostsTest < ActionDispatch::IntegrationTest
  setup do
    @json_headers = { as: :json }
  end

  test "最新順でタイムラインを返す" do
    Post.delete_all

    older = Post.create!(
      user: users(:alice),
      body: "older post",
      rating: 4,
      created_at: 1.hour.ago
    )

    newer = Post.create!(
      user: users(:bob),
      body: "newer post",
      rating: 5,
      created_at: Time.current
    )

    newer.tags << tags(:mythology)
    Like.create!(user: users(:alice), post: newer)

    get api_v1_posts_path, **@json_headers

    assert_response :success
    json = response.parsed_body

    assert_equal "success", json["status"]
    assert_equal [newer.id, older.id], json["data"].map { |p| p["id"] }

    first_post = json["data"].first
    assert_equal newer.user.name, first_post.dig("user", "name")
    assert_equal 1, first_post["likes_count"]
    assert_equal %w[mythology], first_post["tags"].map { |tag| tag["name"] }
  end

  test "ページネーションが機能し、無効値は1ページにフォールバックする" do
    Post.delete_all
    per_page = Api::V1::PostsController::PER_PAGE
    extra_count = per_page + 2

    extra_count.times do |i|
      Post.create!(
        user: users(:alice),
        body: "generated #{i}",
        rating: 3,
        created_at: Time.current + i.seconds
      )
    end

    total_posts = Post.count

    get api_v1_posts_path(page: 2), **@json_headers
    assert_response :success
    page_two = response.parsed_body["data"]
    assert_equal [total_posts - per_page, per_page].min, page_two.length
    assert_operator page_two.length, :>, 0

    get api_v1_posts_path(page: "invalid"), **@json_headers
    assert_response :success
    fallback = response.parsed_body["data"]
    expected_first_page_size = [per_page, total_posts].min
    assert_equal expected_first_page_size, fallback.length
  end

  test "投稿詳細を返す" do
    get api_v1_post_path(posts(:alice_post)), **@json_headers

    assert_response :success
    json = response.parsed_body
    assert_equal "success", json["status"]
    assert_equal posts(:alice_post).id, json.dig("data", "id")
    assert_equal posts(:alice_post).body, json.dig("data", "body")
    assert_equal posts(:alice_post).tags.first.name, json.dig("data", "tags").first["name"]
  end

  test "存在しない投稿は404を返す" do
    get api_v1_post_path(id: -999), **@json_headers

    assert_response :not_found
    json = response.parsed_body
    assert_equal "error", json["status"]
    assert_equal "NOT_FOUND", json.dig("error", "code")
  end

  test "フォロー中タブはフォロー中ユーザーの投稿のみ返す" do
    login_as(users(:alice))
    posts(:alice_post) # ensure fixtures loaded

    get api_v1_posts_path(tab: "following"), **@json_headers

    assert_response :success
    json = response.parsed_body
    ids = json["data"].map { |p| p["id"] }
    assert_includes ids, posts(:bob_post).id
    refute_includes ids, posts(:alice_post).id
  end

  test "未ログインでフォロー中タブにアクセスすると401を返す" do
    get api_v1_posts_path(tab: "following"), **@json_headers

    assert_response :unauthorized
    json = response.parsed_body
    assert_equal "UNAUTHORIZED", json.dig("error", "code")
  end

  private

  def login_as(user)
    post api_v1_login_path,
         params: { email: user.email, password: "password123" },
         **@json_headers
    assert_response :success
  end
end
