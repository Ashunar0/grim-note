### 背景 / 目的
`frontend/app/users/[id]/page.tsx` と `frontend/app/users/[id]/edit/page.tsx` のダミーデータを、docs/04_api.md のプロフィール API と連動させ、docs/05_sitemap.md に沿ったプロフィール閲覧・編集体験を実装する。

- 依存: #4, #9
- ラベル: frontend

### スコープ / 作業項目
- プロフィール表示ページで `GET /api/v1/users/:id` をフェッチし、ロード中・空状態・エラー UI を整備
- `ProfileHeader` コンポーネントに `is_self` `is_following` 等の props を渡し、編集導線/フォローボタン表示を制御
- 編集ページで初期値を API から取得し、`PATCH /api/v1/profile` を送信。成功時に詳細ページへ戻り、失敗時はエラー表示
- 本人以外のユーザーが編集 URL へアクセスした場合のリダイレクト処理を追加
- 型定義や hooks（例: `useProfile`）を `frontend/hooks` などへ整理し、重複ロジックを共通化

### ゴール / 完了条件（Acceptance Criteria）
- [x] `/users/:id` が API レスポンスを描画し、投稿が無い場合の空状態も表示できる
- [x] `ProfileHeader` が `is_self` で編集ボタンの表示・非表示を切り替える
- [x] `/users/:id/edit` が初期値を API から読み込み、PATCH `/api/v1/profile` 成功後にプロフィールへ戻る
- [x] 本人以外が編集 URL にアクセスした際にトップまたはログインへリダイレクトする

### テスト観点
- 結合（フロントのデータフェッチ／フォーム）
- 検証方法: `npm run dev` で閲覧・編集フローを手動確認し、ログイン状態や他ユーザーでの挙動を切り替えて動作確認
