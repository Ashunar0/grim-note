require "test_helper"

class Api::V1::AuthenticationTest < ActionDispatch::IntegrationTest
  setup do
    @json_headers = { as: :json }
  end

  test "登録成功でセッションが開始される" do
    assert_difference "User.count", 1 do
      post api_v1_users_path, params: {
        name: "Test User",
        email: "new_user@example.com",
        password: "password999"
      }, **@json_headers
    end

    assert_response :created
    json = response.parsed_body
    assert_equal "success", json["status"]
    assert_equal "new_user@example.com", json.dig("data", "email")
    assert session[:user_id]
  end

  test "メール重複時はバリデーションエラー" do
    post api_v1_users_path, params: {
      name: "Another",
      email: users(:alice).email,
      password: "password888"
    }, **@json_headers

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert_equal "error", json["status"]
    assert_equal "VALIDATION_ERROR", json.dig("error", "code")
  end

  test "ログイン成功でセッションが保存される" do
    post api_v1_login_path, params: {
      email: users(:alice).email,
      password: "password123"
    }, **@json_headers

    assert_response :success
    json = response.parsed_body
    assert_equal "success", json["status"]
    assert_equal users(:alice).email, json.dig("data", "user", "email")
    assert_equal users(:alice).id, session[:user_id]
  end

  test "ログイン失敗で401が返る" do
    post api_v1_login_path, params: {
      email: users(:alice).email,
      password: "wrongpass"
    }, **@json_headers

    assert_response :unauthorized
    json = response.parsed_body
    assert_equal "error", json["status"]
    assert_equal "UNAUTHORIZED", json.dig("error", "code")
  end

  test "ログアウトでセッションが破棄される" do
    post api_v1_login_path, params: {
      email: users(:alice).email,
      password: "password123"
    }, **@json_headers
    assert_equal users(:alice).id, session[:user_id]

    delete api_v1_logout_path, **@json_headers
    assert_response :success
    assert_nil session[:user_id]
  end

  test "認証済みユーザー情報を取得できる" do
    post api_v1_login_path, params: {
      email: users(:alice).email,
      password: "password123"
    }, **@json_headers

    get api_v1_me_path, **@json_headers
    assert_response :success
    json = response.parsed_body
    assert_equal users(:alice).email, json.dig("data", "user", "email")
  end

  test "未認証状態では現在ユーザー取得が拒否される" do
    get api_v1_me_path, **@json_headers

    assert_response :unauthorized
    json = response.parsed_body
    assert_equal "UNAUTHORIZED", json.dig("error", "code")
  end

  test "ログイン時にセッションIDを再生成する" do
    session_key = "_grim_note_session"
    post api_v1_login_path, params: {
      email: users(:alice).email,
      password: "password123"
    }, headers: { "Cookie" => "#{session_key}=attacker-session-id" }, **@json_headers

    assert_response :success
    set_cookie = response.get_header("Set-Cookie")
    assert_includes set_cookie, session_key
    refute_includes set_cookie, "attacker-session-id"
  end

  test "旧形式のpassword_digestでも500エラーにならない" do
    legacy_user = users(:bob)
    legacy_user.update_column(:password_digest, "legacy-plain-text")

    post api_v1_login_path, params: {
      email: legacy_user.email,
      password: "password123"
    }, **@json_headers

    assert_response :unauthorized
  end
end
