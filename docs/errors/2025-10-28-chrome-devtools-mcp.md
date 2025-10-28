# chrome-devtools-mcp が Transport closed となる問題の調査ログ

- **発生日時**: 2025-10-28
- **事象**: `chrome-devtools-mcp` 経由でブラウザ操作を試みると、DevTools MCP ツール側が常に `Transport closed` エラーを返し、ページ生成・取得ができない。
- **実施した対応**:
  1. `pkill -f chrome-devtools-mcp` で既存プロセスを全て停止。
  2. `chrome-devtools-mcp --headless=true` や `npm exec chrome-devtools-mcp@latest -- --headless=true` を前景/背景で再起動 → いずれも起動直後にセッションが閉じ、ツールからの呼び出しで `Transport closed`。
  3. `DEBUG=*` を付けて起動ログを確認 → `Chrome DevTools MCP Server connected` まで出るが、その後すぐに接続が切断。
  4. `rm -rf ~/.cache/chrome-devtools-mcp` でプロファイルを削除後に再起動 → 同様に `Transport closed`。
- **現状**: 上記手順では問題解消せず。ツール側でブラウザプロセスが継続せずセッションが閉じる模様。
- **メモ**: UI 確認には代替手段（手動操作等）の検討が必要。根本原因調査またはツールの安定化手順が判明したら追記する。
