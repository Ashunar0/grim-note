# bundler 2.3.27 インストールエラー

- 発生日時: 2025-10-26
- 担当: codex
- コマンド: `bundle install`
- 事象: `/usr/bin/bundle` 実行時に `Could not find 'bundler' (2.3.27)` エラーが発生。`gem install bundler:2.3.27` でのインストールも sandbox 制約により失敗。
- 対応方針: ユーザー環境で `gem install bundler:2.3.27` を実行し、再度 `bundle install` を行う。
- 備考: CORS 対応のため `rack-cors` を追加済み。Gem インストールが完了すれば動作確認可能。

## 2025-10-27 追記

- 対応: `gem install --user-install bundler -v 2.3.27` を実行し、ユーザー gem ディレクトリに bundler を配置。`~/.zshrc` の PATH 設定を `Gem.user_dir` を参照する形に更新。
- 確認: 新しいシェルで `bundler -v` を実行し 2.3.27 を確認。sandbox 下で `ps` 実行権限警告は出るが機能に影響なし。
