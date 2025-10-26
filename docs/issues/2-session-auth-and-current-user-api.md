### 背景 / 目的
docs/01_requirements.md と docs/04_api.md で定義されたメール＋パスワード認証を Rails 側へ実装し、フロントから現在ユーザー情報を取得できるようにする。

- 依存: #1
- ラベル: backend, auth

### スコープ / 作業項目
- `POST /api/v1/users` `POST /api/v1/login` `DELETE /api/v1/logout` `GET /api/v1/me` のルーティングとコントローラ実装
- セッション Cookie（HttpOnly/SameSite=Lax）設定と CSRF 対応の確認
- パスワードハッシュ化・バリデーション設定、メール重複時のエラーハンドリング
- リクエストテストで登録・ログイン・ログアウト・未認証アクセスの挙動を検証
- `docs/04_api.md` の例外を参考に、エラーレスポンス整形ロジックを共通化

### ゴール / 完了条件（Acceptance Criteria）
- [x] POST `/api/v1/users` が登録と同時にログインセッションを開始し、重複メール時は `VALIDATION_ERROR` を返す
- [x] POST `/api/v1/login` がパスワードを検証し、失敗時に `UNAUTHORIZED` を返却する
- [x] DELETE `/api/v1/logout` でセッション Cookie が削除される
- [x] GET `/api/v1/me` が現在ユーザー情報を返し、未ログイン時は `UNAUTHORIZED` を返す
- [x] 登録・ログイン・ログアウト・me のリクエストテストが追加される

### テスト観点
- リクエスト
- 検証方法: `bin/rails test TEST=test/requests/api/v1/authentication_test.rb` などでリクエストテストを実行し、Cookie の有効性とエラーハンドリングを確認
