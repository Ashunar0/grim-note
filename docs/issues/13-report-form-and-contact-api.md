### 背景 / 目的

docs/01_requirements.md で定義された通報フォームを `/contact` ページから送れるようにし、docs/04_api.md のレポート API と連携して外部通知を行う。

- 依存: #4
- ラベル: backend, frontend, external

### スコープ / 作業項目

- `POST /api/v1/reports` のコントローラ実装（Slack Webhook または Google Form 連携処理を含む）
- バリデーション（post_id 任意? category 必須?）や rate limiting の検討
- `frontend/app/contact/page.tsx` から API を呼び出し、送信中インジケータ・完了メッセージ・エラー表示を実装
- 投稿詳細ページの通報ボタンから `/contact?postId=xxx` で遷移し、自動入力する処理を実装
- 連携先ごとの設定手順と環境変数記述を docs/02_architecture.md か README/AGENTS に追記

### ゴール / 完了条件（Acceptance Criteria）

- [ ] POST `/api/v1/reports` が post_id・category・message を受け取り、Slack Webhook もしくは Google Form に連携する
- [ ] 送信成功時に成功レスポンスを返し、失敗時は `SERVER_ERROR` とユーザー向けエラーメッセージを表示する
- [ ] `/contact` ページが API を呼び出し、送信中インジケータと完了メッセージを表示する
- [ ] `/posts/:id` の通報ボタンから `?postId=` クエリで遷移した場合にフォームが自動入力される

### テスト観点

- リクエスト（通報 API） / 結合（フロントフォーム）
- 検証方法: Webmock 等で外部連携をスタブしたリクエストテストを実行し、フロントは手動で送信 → 完了 → 失敗ケースを確認

（必要なら）要確認事項:

- 通報連携先として Slack Webhook と Google Form のどちらを採用するか
- Slack Webhook を使います
