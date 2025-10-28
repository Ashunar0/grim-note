# プロジェクト上の留意点

- ここまでの進捗まとめ:

  - Issue #1: Rails スキーマ/モデル/フィクスチャ整備、リクエストテスト基盤構築 (feat: bootstrap relational schema)
  - Issue #2: セッション認証 API 実装、PasswordDigest フォールバック、認証リクエストテスト追加 (feat: implement session auth api / fix: harden session auth behavior)
  - Issue #3: 投稿タイムライン/詳細 API 実装、ページネーション/likes_count 対応、リクエストテスト追加 (feat: add posts timeline api)
  - Issue #4: フロント認証フロー・Auth コンテキスト・API クライアント実装、保護ルート導線整備 (feat: wire next auth flow)
  - テスト: `bin/rails test`, `npm run lint`, `npm run typecheck` 等で主要フロー確認済み

- 回答は日本語で簡潔かつ明確に出力すること。
- UI は明示的な指示がない限り変更しないこと。変更の必要がある場合は許可を取ること。
- 実装中に生じたエラーや疑問点は、docs/配下に md ファイルとして記述・保存しておくこと。
- 当初の設計から逸脱しなければならない場合は、かならず確認を取ること。
- issue を実装した時は、人間が分かるように該当の issue ファイルのチェック欄にどこまで完了したかのチェックを入れること。
- backend/vendor/bundle は、作ったら消さないこと。
- issues/の実装が終わったら、対応する tests/のテストを実行し、テストの結果を最下部の検証結果欄に記載すること。
- 実装がひと段落したら、git にコミットし、リモートに push すること。
- Rails テスト実行時は Ruby 3.1.6 + Bundler 2.3.27 を使用し、`bundle _2.3.27_ exec rails test` で全 27 件が通る状態を維持すること。
- いいね機能実装後は API に `likes_count`/`is_liked` が含まれる。`POST /api/v1/posts/:id/like` は既存ユーザー likes でも 200 を返す (idempotent) ため、フロントは楽観的更新後に再フェッチする実装とすること。
- Rails で新しい controller/serializer を追加した際はサーバー再起動が必要。

- 2025-10-26: Issue #4「next auth flow and session state」を完了。`rack-cors` 導入による CORS 許可設定と `useAuth.refresh()` を用いたセッション更新導線を反映済み。Rails コマンド実行には Bundler 2.3.27 が必要。
- 2025-10-27: Bundler 2.3.27 をユーザー gem に再インストールし、`~/.zshrc` で `Gem.user_dir` を PATH に追加済み。新しいシェルでは `bundler -v` が 2.3.27 を返す。
- 2025-10-27: Issue #5「timeline and post detail api integration」を完了。SWR ベースの `useTimelinePosts` / `usePostDetail` を追加し、`/timeline` と `/posts/:id` が API レスポンスを用いたローディング・エラー・空表示・404 ハンドリングを行うよう更新。PostCard に投稿日表示を追加。`npm run lint` と `npm run typecheck` で検証済み。
- 2025-10-28: Issue #12「follow feature and following timeline」対応済み。`POST/DELETE /api/v1/users/:id/follow` を実装し、タイムライン `tab=following`・プロフィールのフォローステータスを同期。`ProfileHeader` のフォローボタンとタイムラインのフォロー中タブを連携させ、`bin/rails test` と `npm run lint`, `npm run typecheck`, `npm run test -- --run` で確認。ドキュメント `docs/04_api.md` と受入テスト表 `docs/tests/test_12_follow-feature-and-following-timeline.md` を実装仕様に揃え、検証結果欄へ 2025/10/28 実行分を記録済み。
- 2025-10-28: Issue #13「report form and contact api」対応済み。`POST /api/v1/reports` で Slack Webhook (`SLACK_REPORT_WEBHOOK_URL`) へ転送する API と `ReportForm` バリデーションを追加。`/contact` フォームから送信中インジケータ・成功/失敗メッセージを表示し、投稿詳細の通報ボタンは `?postId=` を付与。Slack Webhook URL は `.env.local` 等で設定し、未設定時は SERVER_ERROR を返す。

# Repository Guidelines

## Project Layout

This monorepo hosts a Rails 7 API in `backend/` and a Next.js 16 UI in `frontend/`. Rails code sits in `backend/app`, migrations in `backend/db/migrate`, and tests/fixtures in `backend/test`. Frontend routes reside in `frontend/app`, shared helpers in `frontend/app/lib`, static assets in `frontend/public`, and design docs in `docs/`.

## Build & Run Commands

- `cd backend && bin/setup`: install gems, migrate/prepare the database, clear logs.
- `cd backend && bin/rails server`: boot the API (default port 3000).
- `cd backend && bin/rails test`: execute the full Minitest suite; add `TEST=path` to target files.
- `cd backend && bin/rubocop` / `bin/brakeman`: enforce style and basic security scans.
- `cd frontend && npm install`: sync Node deps; `npm run dev` for local dev, `npm run build` for production, `npm run lint` for ESLint checks.

## Style & Naming Conventions

Rails follows RuboCop Rails Omakase: two-space indent, snake_case files, PascalCase classes, PORO services for business logic, and ActiveRecord over raw SQL. TypeScript obeys the Next.js ESLint core web vitals profile: PascalCase components (`NoteFeed.tsx`), camelCase utilities, Tailwind utilities ordered layout → spacing → color, and explicit types (no implicit `any`).

## Testing Guidelines

Place backend unit and request tests in `backend/test`, naming files `*_test.rb` and classes `SomethingTest`. Frontend tests are not scaffolded yet; plan for React Testing Library in `frontend/__tests__/`, stub API calls, and always run `bin/rails test` plus `npm run lint` before a PR while noting any coverage gaps.

## Commit & Pull Request Guidelines

Use the `type: short description` format from `docs/00_codex.md` (e.g., `feat: add timeline feed`), keep subjects imperative, and add issue references in the body (`Refs: #123`). Commits should bundle related backend/frontend edits; PRs need a clear summary, UI screenshots when relevant, links to requirements, and a checklist of executed commands.

## Design References (docs/)

- `00_codex.md`: sets AI assistant output rules, lint expectations, and banned practices.
- `01_requirements.md`: states the reading-SNS MVP vision, prioritised feature list (auth, posts, timeline, likes/follows), and scope decisions.
- `02_architecture.md`: proposes Vercel + Render hosting, PostgreSQL, session-cookie auth, and a $0/month baseline infra plan.
- `03_database.md`: describes the 6-table schema (users, books, posts, tags, post_tags, likes, follows) with cascade rules and future extensions.
- `04_api.md`: documents `/api/v1` endpoints, JSON envelope format, standard error codes, and request/response samples.
- `05_sitemap.md`: outlines user flows and URLs for timeline, auth, book search/detail, posting, profiles, legal pages, plus SSR/CSR targets.
