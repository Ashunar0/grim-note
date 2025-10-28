require "test_helper"

class Api::V1::UsersProfileTest < ActionDispatch::IntegrationTest
  setup do
    @json_headers = { as: :json }
    @alice = users(:alice)
  end

  test "プロフィールを取得できる" do
    follower = User.create!(
      name: "Charlie Reader",
      email: "charlie@example.com",
      password: "password123"
    )
    Follow.create!(follower: follower, followee: @alice)
    login_as(follower)
    newer_post = @alice.posts.create!(
      book: books(:norwegian_wood),
      body: "Fresh insights about literature.",
      rating: 4,
      read_at: Date.new(2025, 1, 1),
      created_at: Time.zone.parse("2025-01-02 12:00:00")
    )
    older_post = posts(:alice_post)
    older_post.update!(created_at: Time.zone.parse("2024-01-01 09:00:00"))

    get api_v1_user_path(@alice), **@json_headers

    assert_response :success
    json = response.parsed_body
    data = json["data"]
    assert_equal @alice.id, data["id"]
    assert_equal @alice.name, data["name"]
    assert_equal @alice.bio, data["bio"]
    assert_equal @alice.received_follows.count, data["follower_count"]
    assert_equal 1, data["following_count"]
    assert_equal @alice.posts.count, data["post_count"]
    assert data["is_following"]
    refute data["is_self"]

    posts_payload = data["posts"]
    assert_equal 2, posts_payload.size
    assert_equal newer_post.id, posts_payload.first["id"]
    assert_equal older_post.id, posts_payload.second["id"]
    assert_equal newer_post.book.title, posts_payload.first.dig("book", "title")
  end

  test "未ログインではフォローフラグが false になる" do
    get api_v1_user_path(@alice), **@json_headers

    assert_response :success
    json = response.parsed_body
    data = json["data"]
    refute data["is_following"]
    refute data["is_self"]
  end

  test "存在しないユーザーは 404 を返す" do
    get api_v1_user_path(-999), **@json_headers

    assert_response :not_found
    json = response.parsed_body
    assert_equal "NOT_FOUND", json.dig("error", "code")
  end

  test "本人がプロフィールを更新できる" do
    login_as(@alice)

    patch api_v1_profile_path,
          params: {
            name: "Alice Updated",
            bio: "Updated bio",
            icon_url: "https://example.com/new-icon.png"
          },
          **@json_headers

    assert_response :success
    @alice.reload
    assert_equal "Alice Updated", @alice.name
    assert_equal "Updated bio", @alice.bio
    assert_equal "https://example.com/new-icon.png", @alice.icon_url
  end

  test "プロフィール更新時に長すぎる自己紹介は 422 を返す" do
    login_as(@alice)

    patch api_v1_profile_path,
          params: {
            bio: "a" * 200
          },
          **@json_headers

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert_equal "VALIDATION_ERROR", json.dig("error", "code")
  end

  test "他人を指定した更新は FORBIDDEN を返す" do
    outsider = User.create!(
      name: "Dana Observer",
      email: "dana@example.com",
      password: "password123"
    )
    login_as(outsider)

    patch api_v1_profile_path,
          params: {
            id: @alice.id,
            name: "Hacked Name"
          },
          **@json_headers

    assert_response :forbidden
    json = response.parsed_body
    assert_equal "FORBIDDEN", json.dig("error", "code")
    @alice.reload
    assert_equal "Alice Reader", @alice.name
  end

  test "未ログインでプロフィール更新すると UNAUTHORIZED" do
    patch api_v1_profile_path,
          params: { name: "Anonymous" },
          **@json_headers

    assert_response :unauthorized
    json = response.parsed_body
    assert_equal "UNAUTHORIZED", json.dig("error", "code")
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
