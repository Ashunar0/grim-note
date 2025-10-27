# Ruby バージョン不一致による bundle install 失敗

- 発生日時: 2025-10-27
- 担当: codex
- コマンド: `bundle install`
- 事象: デフォルトの `ruby` (2.6.10) で bundle を実行したところ、Rails 7.2 の依存関係により「Ruby (>= 3.1.0) が必要」とのエラーで失敗。
- 対応: `~/.rbenv/shims/bundle`（Ruby 3.1.6 向けシム）経由でコマンドを再実行し、依存関係の解決に成功。
- 再発防止: Rails コマンド／bundle 実行時は rbenv の 3.1.6 シム (`/Users/a.kawanobe/.rbenv/shims/bundle`) を用いる。
