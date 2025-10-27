# Grim Note

読書感想を共有する SNS「Grim Note」の開発プロジェクトです。Rails をバックエンド API、Next.js をフロントエンドに採用し、セッション Cookie 方式で認証を行います。設計方針や MVP スコープは `docs/` 配下のドキュメントにまとまっています。

## アーキテクチャ概要
- Backend: Ruby on Rails 7 (API モード、RDBMS: SQLite3 → 将来的に PostgreSQL)
- Frontend: Next.js 13 (App Router, TypeScript, Tailwind CSS, shadcn/ui)
- 認証: Rails セッション Cookie (HttpOnly, Secure, SameSite=Lax)
- 外部連携: Google Books API（書籍検索）

## ディレクトリ構成（抜粋）
```
backend/      Rails API (app/, db/, test/ など)
frontend/     Next.js アプリ (app/, components/, lib/)
docs/         要件・設計資料、実装ロードマップ・Issue 一覧
docs/issues/  各 Issue の詳細タスク
```

## 必要要件
- Ruby 3.1.6
- Node.js 20 系 (LTS 推奨) / npm 9 以上
- SQLite3（ローカル開発用）
- Bun や Yarn は不要、npm を使用

## セットアップ
### 1. リポジトリ取得
```
git clone <this-repo>
cd grim-note
```

### 2. Backend
```
cd backend
bin/setup
```
- `bin/setup` で依存 gem インストール、DB マイグレーション、ログクリアを実行
- 以降の DB 操作用コマンド: `bin/rails db:migrate`, `bin/rails db:seed`

### 3. Frontend
```
cd frontend
npm install
```
- 依存パッケージをインストール
- 型チェック: `npm run typecheck`

## 開発サーバ起動
バックエンドとフロントエンドを別ターミナルで起動します。

Backend:
```
cd backend
bin/rails server
```

Frontend (3000 番ポートが埋まっている場合は `PORT=3001` を指定):
```
cd frontend
npm run dev
```

## テスト・品質チェック
- Rails テスト: `cd backend && bin/rails test`
- Rails lint: `cd backend && bin/rubocop`
- Next.js lint: `cd frontend && npm run lint`
- （任意）型チェック: `cd frontend && npm run typecheck`

将来的に `docs/issues/14-quality-gates-and-ci-setup.md` のとおり CI ワークフローと統合チェックスクリプトを整備予定です。

## 環境変数
今後の実装で以下の変数を利用予定です。必要に応じて `.env` やデプロイ先の環境変数に設定してください。
- `GOOGLE_BOOKS_API_KEY`: Google Books API のキー。例: `backend/.env.local` に `GOOGLE_BOOKS_API_KEY="your-api-key"` を記述し、シェルで `set -a; source backend/.env.local; set +a` または `~/.zshrc` に `export GOOGLE_BOOKS_API_KEY=...` を追記して読み込む
- `SESSION_SECRET` など Rails セッション関連のシークレット（Rails 7 では `bin/rails credentials:edit` で管理）

## 設計ドキュメント
- MVP/優先度: `docs/01_requirements.md`
- アーキテクチャ方針: `docs/02_architecture.md`
- データベース定義: `docs/03_database.md`
- REST API 仕様: `docs/04_api.md`
- サイトマップと画面一覧: `docs/05_sitemap.md`
- 実装ロードマップ & Issue 概要: `docs/implementation-roadmap.md`
- 各 Issue 詳細: `docs/issues/*.md`

## 開発フロー
1. `docs/implementation-roadmap.md` のフェーズ・依存関係を確認
2. 対応する `docs/issues/<number>*.md` を参照し、スコープと AC を満たすように実装
3. コード変更後にテスト・lint を実行
4. コミットメッセージは `type: subject` 形式（例: `feat: add posts timeline api`）で統一
5. PR には実行コマンドの結果や確認事項を記載し、必要に応じて UI スクリーンショットを添付

## 補足
- 認証や投稿フローはまだダミーデータ実装の段階です。Issue に沿って API 連携やバックエンド実装を進めてください。
- 外部 API・通報連携など運用方針が未確定の項目については、Issue 内の「要確認事項」を参照の上で判断します。
