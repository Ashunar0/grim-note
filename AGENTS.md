回答は日本語で簡潔かつ明確に出力すること。
UI は明示的な指示がない限り変更しないこと。変更の必要がある場合は許可を取ること。

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
