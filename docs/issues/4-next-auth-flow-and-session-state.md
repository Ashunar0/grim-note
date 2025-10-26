### 背景 / 目的
フロントエンドのログイン/登録 UI（`frontend/app/(auth)/login`, `frontend/app/(auth)/register`）を docs/04_api.md の認証 API と連携し、docs/05_sitemap.md の導線どおりにセッションを維持できるようにする。

- 依存: #2
- ラベル: frontend, auth

### スコープ / 作業項目
- `frontend/lib` に API クライアントを追加し、認証系リクエストで `credentials: "include"` を設定
- 認証結果を管理する context または hook（例: `useAuth`）を作成し、`Header` やレイアウトでユーザー情報を参照可能にする
- ログイン/登録フォームから API を呼び出し、成功時に `/timeline` へ遷移・失敗時にフォーム内でエラー表示
- ログアウトメニュー（`Header.tsx`）でセッション破棄後に `/login` へ遷移させる
- 認証必須ページ（例: `/timeline`, `/posts/new`）で未ログインの場合に `/login` へリダイレクトする仕組みを実装

### ゴール / 完了条件（Acceptance Criteria）
- [ ] ログイン/登録フォームが API を呼び出して成功時にタイムラインへ遷移し、エラー内容をフォーム内に表示する
- [ ] フロント共通の API クライアントで `credentials: "include"` を利用する
- [ ] `/api/v1/me` を利用した認証コンテキストまたは hook が追加され、ユーザー情報をヘッダーに反映する
- [ ] 認証必須ページで未ログイン時に `/login` へリダイレクトする

### テスト観点
- E2E / 結合（Next.js 側）
- 検証方法: ローカル環境で `npm run dev` を起動し、フォーム送信→遷移→再読み込みでセッションが維持されること、エラーメッセージが表示されることを手動確認
