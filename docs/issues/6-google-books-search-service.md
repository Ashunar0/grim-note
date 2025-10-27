### 背景 / 目的
docs/01_requirements.md の書誌検索要件と docs/04_api.md の `/api/v1/books/search` 仕様を実現し、投稿作成フローで Google Books 情報を取得できるようにする。

- 依存: #2
- ラベル: backend, external

### スコープ / 作業項目
- Google Books API 呼び出しを行うサービスクラス（`app/services/google_books/search_service.rb` など）を実装
- `GET /api/v1/books/search` エンドポイントを追加し、`q` パラメータ必須のバリデーションを実装
- レスポンス整形で title・authors・isbn13・published_year を正規化し、欠損値のフォールバックを定義
- 外部 API 失敗時に `SERVER_ERROR` を返却し、ログへ詳細を残すエラーハンドリング
- リクエストテストで正常系・0 件・失敗時のレスポンスを検証し、`ENV["GOOGLE_BOOKS_API_KEY"]` の設定手順をドキュメント化

### ゴール / 完了条件（Acceptance Criteria）
- [x] サービスクラスで Google Books API を呼び出し、タイトル・著者・出版年・ISBN13 を正規化する
- [x] GET `/api/v1/books/search` が `q` パラメータ必須で結果を返し、0 件時は空配列を返却する
- [x] 失敗時に `SERVER_ERROR` を返し、ログへスタックトレースを残す
- [x] API キーを `ENV["GOOGLE_BOOKS_API_KEY"]` から取得し、設定手順をドキュメント化する

### テスト観点
- リクエスト / サービス
- 検証方法: Webmock 等で Google Books API をスタブしたリクエストテストを `bin/rails test` で実行。ローカルで環境変数設定後に `curl` で実呼び出し確認
