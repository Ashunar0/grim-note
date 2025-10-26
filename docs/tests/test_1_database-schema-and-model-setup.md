**ファイルパス**: `docs/tests/test_1_database-schema-and-model-setup.md`

# テストケース: データベーススキーマとモデル定義

対象 Issue: #1  
関連ドキュメント:

- [要件定義書](../01_requirements.md)
- [DB スキーマ定義](../03_database.md)

---

## 概要

- 目的: users・books・posts・tags・post_tags・likes・follows 各テーブルとモデル実装が要件どおりであることを確認する。
- スコープ: マイグレーション実行、モデル関連付け・バリデーション、fixtures 読み込み、`schema.rb` のインデックス/制約確認。
- 対象: User, Book, Post, Tag, PostTag, Like, Follow 各モデルおよび対応テーブル。

## 前提条件

- 環境: Ruby 3.1.6 / Rails 7.2.x / SQLite3（ローカル）
- 初期データ: `backend/test/fixtures/*.yml` を利用可能とする。
- 認証・権限: 本 Issue では不要。

## AC トレーサビリティ

| AC 番号 | 内容（要約）                                                                                     | 検証ケース ID                    |
| ------- | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| AC-1    | 主要テーブルの作成・制約・インデックスが定義されている                                           | TEST-1-01, TEST-1-02, TEST-1-04 |
| AC-2    | モデル関連付けと基本バリデーションが実装されている                                               | TEST-1-03, TEST-1-05            |
| AC-3    | `bin/rails db:migrate` と `bin/rails db:test:prepare` が成功する                                 | TEST-1-01, TEST-1-02            |
| AC-4    | 更新された `schema.rb` とモデルがレビュー可能（fixtures を含む）                                | TEST-1-03, TEST-1-04, TEST-1-05 |

## テスト観点一覧

- ポジティブ: 正常マイグレーション、モデル保存、fixtures ロード。
- ネガティブ: バリデーション/ユニーク制約違反、自己フォロー禁止。
- 境界値: Post 本文 500/501 文字、rating 下限/上限。
- 整合性: 外部キー/中間テーブルの関連付け、インデックス/制約の存在。

## テストケース（詳細）

| ID         | 観点                 | 目的                                                     | 前提                             | 手順                                                                                                                                  | 期待結果                                                                                      | AC   |
| ---------- | -------------------- | -------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---- |
| TEST-1-01  | マイグレーション     | 本番 DB 用マイグレーションが成功することを確認          | Rails プロジェクトがクリーン状態 | 1) `bin/rails db:drop db:create` 2) `bin/rails db:migrate`                                                                           | コマンドがエラーなく完了し、`db/schema.rb` が生成される                                       | AC-1, AC-3 |
| TEST-1-02  | テスト DB 準備       | テスト DB 準備タスクが成功し schema が同期されること確認 | TEST-1-01 実施済み               | 1) `bin/rails db:test:prepare`                                                                                                      | エラーなく完了し、test DB にテーブルが作成される                                             | AC-1, AC-3 |
| TEST-1-03  | バリデーション       | Post の本文長・rating の境界を確認しモデル定義を検証    | fixtures もしくは Factory 利用可 | 1) User/Book を作成 2) 本文 500 文字・rating=1 の Post を生成→保存成功 3) 本文 501 文字 or rating=0 の Post を生成→保存失敗         | 500 文字・rating=1 は成功、501 文字または rating=0 でバリデーションエラー                     | AC-2, AC-4 |
| TEST-1-04  | 制約・インデックス   | schema にユニーク制約と複合インデックスが存在するか確認 | `db/schema.rb` 更新済み         | 1) `db/schema.rb` を開き、users.email, tags.name, post_tags(post_id, tag_id), follows(follower_id, followee_id) の index を確認      | 該当インデックス/ユニーク制約が schema に記載されている                                       | AC-1, AC-4 |
| TEST-1-05  | 関連付け・整合性     | 中間テーブルと自己フォロー禁止など関連制約を確認        | TEST-1-02 実施済み               | 1) `bin/rails console` 2) 既存 fixtures を読み込み 3) `Post.first.tags << Tag.first` で多対多が成立 4) User が自分を Follow 作成→失敗 | 多対多関連付けが成功し、自己フォロー作成時にバリデーションエラー（または例外）となる         | AC-2, AC-4 |

## データセット（例）

- `users(:alice)` / `books(:norwegian_wood)` / `posts(:alice_post)` など既存 fixtures。
- 文字列境界値: `"a" * 500`, `"a" * 501`。
- rating 境界: 1, 5（有効） / 0, 6（無効）。

## 実行コマンド例

```bash
bin/rails db:drop db:create
bin/rails db:migrate
bin/rails db:test:prepare
bin/rails test test/models/post_test.rb
```

## 成果物

- 各テスト実施ログを本ファイルの「検証結果」へ追記
- 追加資料があれば `docs/tests/assets/` 配下へ保存

## 検証結果（記録用）

| 実施日     | 担当 | 結果 | メモ |
| ---------- | ---- | ---- | ---- |
| 2025/10/26 | a.kawanobe | ✅   | `bundle exec rails db:drop db:create db:migrate`, `db:test:prepare`, `rails runner /tmp/test_issue_1.rb`, `rails test` を実行し、すべて成功 |

## 要確認事項（未確定・オープン）

- 自己フォロー禁止を DB レベルでも担保するか（アプリケーションバリデーションのみで許容するか）
- rating 用 CHECK 制約を将来的に DB 互換性（PostgreSQL への移行）まで確認する必要があるか

---
