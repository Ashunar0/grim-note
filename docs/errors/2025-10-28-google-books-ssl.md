# Google Books API の SSL 検証エラー対応メモ

- **発生日時**: 2025-10-27〜2025-10-28
- **事象**: 開発環境で `GET /api/v1/books/search` を叩くと `SSL_connect returned=1 errno=0 ... certificate verify failed (unable to get certificate CRL)` で 500 応答となり、GoogleBooks::SearchService の Net::HTTP 接続が失敗していた。
- **切り分け経緯**:
  - `bundle install`, Rails サーバ再起動では解消せず。
  - `curl` で API を直接叩いた際はシェルで URL のエスケープが必要なだけで、API キーは有効であると確認。
  - Homebrew の `curl-ca-bundle` を導入し、`SSL_CERT_FILE=/opt/homebrew/etc/ca-certificates/cert.pem` と `SSL_CERT_DIR=/opt/homebrew/etc/ca-certificates` を環境変数に設定。
  - `bundle exec rails runner 'puts ENV["SSL_CERT_FILE"]'` で Rails プロセスが参照する証明書パスを確認。
- **結果**: 上記証明書バンドル設定を適用後、再度 `GET /api/v1/books/search` を実行すると正常に Google Books API へ接続でき、書籍検索がフロントから成功することを確認。
- **補足**:
  - Google Books API 呼び出しは引き続き Rails 側から代理実行する方針（API キー秘匿とエラーハンドリング一元化のため）。
  - 開発環境ではシェル起動時に `SSL_CERT_FILE` / `SSL_CERT_DIR` を読み込むよう `~/.zshrc` 等へ追記しておくと再発を防げる。
