require "test_helper"

class Api::V1::UserFollowsTest < ActionDispatch::IntegrationTest
  setup do
    @json_headers = { as: :json }
    @alice = users(:alice)
    @bob = users(:bob)
  end

  test "認証なしではフォローできない" do
    post api_v1_user_follow_path(@bob), params: {}, **@json_headers

    assert_response :unauthorized
    assert_equal "UNAUTHORIZED", response.parsed_body.dig("error", "code")
  end

  test "フォローを追加できる" do
    login_as(@alice)
    Follow.where(follower: @alice, followee: @bob).delete_all

    assert_difference -> { Follow.count }, 1 do
      post api_v1_user_follow_path(@bob), params: {}, **@json_headers
    end

    assert_response :created
    data = response.parsed_body["data"]
    assert_equal @bob.id, data["user_id"]
    assert_equal true, data["is_following"]
    assert_equal @bob.received_follows.count, data["follower_count"]
  end

  test "重複フォローは無視される" do
    login_as(@alice)
    Follow.find_or_create_by!(follower: @alice, followee: @bob)

    assert_no_difference -> { Follow.count } do
      post api_v1_user_follow_path(@bob), params: {}, **@json_headers
    end

    assert_response :success
    assert response.parsed_body.dig("data", "is_following")
  end

  test "フォロー解除ができる" do
    login_as(@alice)
    Follow.find_or_create_by!(follower: @alice, followee: @bob)
    initial = @bob.received_follows.count

    assert_difference -> { Follow.count }, -1 do
      delete api_v1_user_follow_path(@bob), params: {}, **@json_headers
    end

    assert_response :success
    data = response.parsed_body["data"]
    assert_equal initial - 1, data["follower_count"]
    refute data["is_following"]
  end

  test "自分自身はフォローできない" do
    login_as(@alice)

    post api_v1_user_follow_path(@alice), params: {}, **@json_headers

    assert_response :unprocessable_entity
    assert_equal "INVALID_OPERATION", response.parsed_body.dig("error", "code")
  end

  test "存在しないユーザーは 404 を返す" do
    login_as(@alice)

    delete api_v1_user_follow_path(-999), params: {}, **@json_headers

    assert_response :not_found
    assert_equal "NOT_FOUND", response.parsed_body.dig("error", "code")
  end

  private

  def login_as(user)
    post api_v1_login_path,
         params: { email: user.email, password: "password123" },
         **@json_headers
    assert_response :success
  end
end
