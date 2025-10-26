### 背景 / 目的
`frontend/app/posts/new/page.tsx` と `frontend/app/books/search/page.tsx` のダミー動作を、docs/04_api.md の投稿作成・書籍検索 API と接続して実際の投稿フローを完成させる。

- 依存: #4, #6, #7
- ラベル: frontend

### スコープ / 作業項目
- 書籍検索ページで `GET /api/v1/books/search` を呼び出し、ローディング・エラー・0 件表示を実装
- 検索結果から投稿ページへ書籍情報を受け渡す仕組み（query param や Zustand など）を追加
- 投稿フォームで `POST /api/v1/posts` を呼び出し、送信中状態・成功時の `/timeline` リダイレクト・エラー表示を実装
- タグ入力で複数タグを配列化し、フォームバリデーション（必須チェック等）を追加
- API 型定義を `frontend/types` に整理し、フォーム送信ロジックの単体テストも検討

### ゴール / 完了条件（Acceptance Criteria）
- [ ] `/books/search` が API 結果を表示し、ロード中・エラー・0 件表示を切り替える
- [ ] 検索結果から選んだ書籍情報が `/posts/new` のフォームに反映される
- [ ] 投稿フォーム送信時に POST `/api/v1/posts` が呼ばれ、成功時にタイムラインへリダイレクトする
- [ ] バリデーションエラー時にフォーム内へメッセージが表示され、送信ボタンの多重押下が防止される

### テスト観点
- 結合（フロントのフォーム）
- 検証方法: `npm run dev` 環境で書籍検索〜投稿作成を手動確認。可能であれば React Testing Library でフォーム送信のユニットテストを追加
