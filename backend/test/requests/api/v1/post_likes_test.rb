require "test_helper"

class Api::V1::PostLikesTest < ActionDispatch::IntegrationTest
  setup do
    @json_headers = { as: :json }
    @alice = users(:alice)
    @bob = users(:bob)
    @alice_post = posts(:alice_post)
  end

  test "認証なしではいいねできない" do
    post api_v1_post_like_path(@alice_post), params: {}, **@json_headers

    assert_response :unauthorized
    json = response.parsed_body
    assert_equal "UNAUTHORIZED", json.dig("error", "code")
  end

  test "投稿にいいねを追加できる" do
    liker = User.create!(name: "Charlie", email: "charlie@example.com", password: "password123")
    login_as(liker)

    initial_count = @alice_post.likes.count

    assert_difference -> { Like.count }, 1 do
      post api_v1_post_like_path(@alice_post), params: {}, **@json_headers
    end

    assert_response :created
    json = response.parsed_body
    data = json["data"]
    assert_equal @alice_post.id, data["id"]
    assert_equal true, data["is_liked"]
    assert_equal initial_count + 1, data["likes_count"]
  end

  test "重複いいねは発生しない" do
    liker = User.create!(name: "Diana", email: "diana@example.com", password: "password123")
    login_as(liker)
    Like.create!(user: liker, post: @alice_post)

    assert_no_difference -> { Like.count } do
      post api_v1_post_like_path(@alice_post), params: {}, **@json_headers
    end

    assert_response :success
    json = response.parsed_body
    assert_equal true, json.dig("data", "is_liked")
  end

  test "いいねを解除できる" do
    liker = User.create!(name: "Eve", email: "eve@example.com", password: "password123")
    login_as(liker)
    Like.create!(user: liker, post: @alice_post)
    @alice_post.reload

    initial_count = @alice_post.likes.count

    assert_difference -> { Like.count }, -1 do
      delete api_v1_post_like_path(@alice_post), params: {}, **@json_headers
    end

    assert_response :success
    json = response.parsed_body
    assert_equal false, json.dig("data", "is_liked")
    assert_equal initial_count - 1, json.dig("data", "likes_count")
  end

  test "存在しない投稿は 404 を返す" do
    login_as(@alice)

    delete api_v1_post_like_path(-999), params: {}, **@json_headers

    assert_response :not_found
    json = response.parsed_body
    assert_equal "NOT_FOUND", json.dig("error", "code")
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
