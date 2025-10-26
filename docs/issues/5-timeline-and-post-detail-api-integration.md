### 背景 / 目的
`frontend/app/timeline/page.tsx` や `frontend/app/posts/[id]/page.tsx` のダミーデータを排し、docs/04_api.md で定義された投稿 API を利用して実データ表示へ切り替える。

- 依存: #3, #4
- ラベル: frontend

### スコープ / 作業項目
- タイムラインページで SWR/React Query などを用いた `GET /api/v1/posts` の取得とローディング・エラー UI 実装
- タブ切り替え時に `tab=following` パラメータを付与するクエリを実装（フォロー機能実装前は空状態を表示）
- 投稿カードコンポーネントを API レスポンス構造（ユーザー名・likes_count・タグ等）に合わせて更新
- 投稿詳細ページで `GET /api/v1/posts/:id` を呼び出し、404 時にメッセージと遷移先リンクを表示
- 必要なユーティリティ（例: 日付フォーマット）や型定義を `frontend/types` などへ追加

### ゴール / 完了条件（Acceptance Criteria）
- [ ] `/timeline` が GET `/api/v1/posts` のレスポンスをレンダリングし、ロード中と空状態を表示できる
- [ ] タブ切り替え時に `tab=following` を付けたリクエストを送る実装が入り、フォロー中タブは Issue #12 まで空表示で劣化しない
- [ ] 投稿カードが likes_count やタグなど API 値を使用する
- [ ] `/posts/:id` が GET `/api/v1/posts/:id` を呼び出し、404 時に専用メッセージを表示する

### テスト観点
- 結合（フロントのデータフェッチ）
- 検証方法: `npm run dev` で実機確認し、API フィクスチャと組み合わせて一覧・詳細・404 を手動確認。可能であれば簡易的な Playwright テストを追加
