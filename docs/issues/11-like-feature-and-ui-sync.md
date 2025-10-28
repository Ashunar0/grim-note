### 背景 / 目的
docs/01_requirements.md のいいね機能と docs/04_api.md の `/api/v1/posts/:id/like` を実装し、タイムラインおよび投稿詳細のリアクションがサーバーデータと連動するようにする。

- 依存: #5
- ラベル: backend, frontend

### スコープ / 作業項目
- `POST/DELETE /api/v1/posts/:id/like` のコントローラとサービス実装（重複登録防止・本人チェック）
- タイムライン/詳細 API レスポンスへ `likes_count` `is_liked` を追加し、直近のいいね状態を返却
- フロントのいいねボタン（`PostCard`, 投稿詳細）から API 呼び出しを行い、楽観的更新 or 再フェッチを実装
- 未ログイン時のいいね操作でログインモーダル表示または `/login` へ遷移する処理を追加
- リクエストテスト（Rails）とフロント単体テストで成功・失敗シナリオを確認

### ゴール / 完了条件（Acceptance Criteria）
- [x] POST/DELETE `/api/v1/posts/:id/like` が likes テーブルを更新し、重複登録を防止する
- [x] タイムライン・詳細 API に `likes_count` と `is_liked` が含まれる
- [x] フロントのいいねボタンが API を呼び出し、成功時にカウントとハート表示が反映される
- [x] 未ログイン時の操作でログインダイアログまたはリダイレクトが表示される

### テスト観点
- リクエスト（いいね API） / 結合（フロント）
- 検証方法: Rails リクエストテストでトグル処理と権限制御を確認し、フロント側は `npm run dev` で動作確認または React Testing Library でハンドラの動作をテスト
