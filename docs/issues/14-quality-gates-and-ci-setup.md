### 背景 / 目的
MVP の品質を維持するため、docs/00_codex.md の lint 期待と docs/02_architecture.md の運用方針に沿って CI を構築し、テスト手順を標準化する。

- 依存: #5, #8, #10, #12, #13
- ラベル: infra, backend, frontend

### スコープ / 作業項目
- GitHub Actions ワークフローを追加し、`bin/rails test`, `bin/rubocop`, `npm run lint` を並列または直列で実行
- ローカル開発用に lint/test をまとめたスクリプト（`bin/check` など）や Makefile タスクを用意
- Rails リクエストテスト・モデルテストの補完、React テンプレートで最低限の smoke テストを追加
- README もしくは AGENTS.md に品質チェックと CI の使い方を追記
- CI 成功のスクリーンショットやログ記録を残す（PR コメントなど）

### ゴール / 完了条件（Acceptance Criteria）
- [ ] GitHub Actions で `bin/rails test`, `bin/rubocop`, `npm run lint` を実行するワークフローが追加される
- [ ] ローカル実行用に lint/test をまとめたスクリプトまたは make タスクが追加される
- [ ] 主要 API とフロントのユースケースに対するテスト（Minitest リクエストテスト + smoke レベルの React テスト）が追加される
- [ ] `AGENTS.md` もしくは README に品質チェックの手順が追記される

### テスト観点
- CI / 自動テスト
- 検証方法: GitHub Actions 上でワークフローが成功することを確認し、ローカルで統合チェックコマンドを実行して同様の結果になることを確認
