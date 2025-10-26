# bundler 2.3.27 インストールエラー

- 発生日時: 2025-10-26
- 担当: codex
- コマンド: `bundle install`
- 事象: `/usr/bin/bundle` 実行時に `Could not find 'bundler' (2.3.27)` エラーが発生。`gem install bundler:2.3.27` でのインストールも sandbox 制約により失敗。
- 対応方針: ユーザー環境で `gem install bundler:2.3.27` を実行し、再度 `bundle install` を行う。
- 備考: CORS 対応のため `rack-cors` を追加済み。Gem インストールが完了すれば動作確認可能。
