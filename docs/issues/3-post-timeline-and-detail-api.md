### 背景 / 目的
docs/04_api.md のタイムライン仕様と docs/01_requirements.md の「新着投稿一覧」を満たすため、投稿一覧・詳細 API を実装してフロントのデータ取得基盤を用意する。

- 依存: #1
- ラベル: backend

### スコープ / 作業項目
- `GET /api/v1/posts` と `GET /api/v1/posts/:id` のルーティング・コントローラ実装
- ユーザー・書籍・タグ・いいね数を含むシリアライザ（または presenter）の作成
- `page` クエリによるページネーション処理（kaminari 等）の導入とパラメータバリデーション
- 存在しない投稿アクセス時の `NOT_FOUND` ハンドリング
- Minitest リクエストテストで一覧・詳細・ページネーション・404 ケースをカバー

### ゴール / 完了条件（Acceptance Criteria）
- [x] GET `/api/v1/posts` が投稿を最新順で返し、ユーザー・書籍・タグ・likes_count を含む
- [x] クエリ `page` でページネーションでき、無効値は 1 ページ目にフォールバックする
- [x] GET `/api/v1/posts/:id` が詳細情報を返し、存在しない場合は `NOT_FOUND`
- [x] タイムライン関連のリクエストテストが追加される

### テスト観点
- リクエスト
- 検証方法: `bin/rails test TEST=test/requests/api/v1/posts_test.rb` 等で一覧・詳細・ページネーションのレスポンス内容とエラーパターンを確認
