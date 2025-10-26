### 背景 / 目的
docs/05_sitemap.md のプロフィールページ要件と docs/04_api.md のユーザー情報 API を実装し、ユーザー自身のプロフィール更新と他ユーザー閲覧を可能にする。

- 依存: #1, #2, #3
- ラベル: backend

### スコープ / 作業項目
- `GET /api/v1/users/:id` と `PATCH /api/v1/profile` のコントローラ実装、ルーティング追加
- プロフィールに必要な follower_count / following_count / post_count / is_following / is_self の算出
- `PATCH /api/v1/profile` の権限制御（本人のみ）、パラメータバリデーション（名前・自己紹介・アイコン URL 長さなど）
- プロフィールレスポンスのシリアライザ整理（投稿一覧を含める）
- Minitest リクエストテストで閲覧・更新・権限制御・未ログインアクセスを検証

### ゴール / 完了条件（Acceptance Criteria）
- [ ] GET `/api/v1/users/:id` がプロフィール情報と投稿一覧、follower_count・following_count・post_count を返す
- [ ] レスポンスに `is_following` と `is_self` を含める（未ログイン時は false）
- [ ] PATCH `/api/v1/profile` が名前・自己紹介・アイコン URL を更新し、本人以外は `FORBIDDEN`
- [ ] プロフィール取得・更新のリクエストテストが用意される

### テスト観点
- リクエスト
- 検証方法: `bin/rails test TEST=test/requests/api/v1/users_test.rb` などで閲覧・更新・権限制御ケースを実行し、レスポンス構造を確認
