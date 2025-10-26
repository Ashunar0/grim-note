**ファイルパス**: `docs/tests/test_2_session-auth-and-current-user-api.md`

# テストケース: セッション認証と現在ユーザー API

対象 Issue: #2  
関連ドキュメント:

- [要件定義書](../01_requirements.md)
- [DB スキーマ定義](../03_database.md)
- [API 設計](../04_api.md)
- [アーキテクチャ](../02_architecture.md)

---

## 概要

- 目的: メール・パスワード認証とセッション管理 API が MVP 要件どおり動作することを確認する。
- スコープ: `/api/v1/users` `/api/v1/login` `/api/v1/logout` `/api/v1/me` のルーティング・レスポンス・セッション制御・バリデーション。
- 対象: `UsersController`, `SessionsController`, `CurrentUsersController`, `ApplicationController` の共通レスポンス処理、および `User` モデル。

## 前提条件

- 環境: Ruby 3.1.6 / Rails 7.2 / SQLite3（ローカル）。
- 初期データ: `users.yml` フィクスチャ（例: `users(:alice)`）を利用。
- 認証・権限: セッション Cookie (HttpOnly, SameSite=Lax)。CSRF 対策は Rails 標準を使用。

## AC トレーサビリティ

| AC 番号 | 内容（要約）                                                         | 検証ケース ID                    |
| ------- | -------------------------------------------------------------------- | -------------------------------- |
| AC-1    | `/users` で登録＆セッション開始、重複メール時 `VALIDATION_ERROR`     | TEST-02-01, TEST-02-02           |
| AC-2    | `/login` でパスワード検証、失敗時 `UNAUTHORIZED`                    | TEST-02-03, TEST-02-04           |
| AC-3    | `/logout` でセッション Cookie を削除                                | TEST-02-05                       |
| AC-4    | `/me` で現在ユーザー取得、未ログイン時 `UNAUTHORIZED`               | TEST-02-06, TEST-02-07           |
| AC-5    | リクエストテスト追加（登録/ログイン/ログアウト/me）                 | TEST-02-08                       |

## テスト観点一覧

- ポジティブ: 新規登録成功、ログイン成功、`/me` 成功レスポンス。
- ネガティブ: 重複メール、誤ったパスワード、未認証アクセス。
- 境界値: パスワード最小長・メールフォーマット（モデル単体テストで補完）。
- セキュリティ: Cookie 属性 (HttpOnly/SameSite) / セッション破棄確認。
- 回帰: リクエストテスト群の自動化実行。

## テストケース（詳細）

| ID         | 観点             | 目的                                                         | 前提                      | 手順                                                                                                                                      | 期待結果                                                                                     | AC     |
| ---------- | ---------------- | ------------------------------------------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| TEST-02-01 | 登録成功         | 新規登録でセッション開始とユーザー情報返却を確認            | 未使用メールを準備        | 1) `POST /api/v1/users` に `{name,email,password}` を送信 2) レスポンスを確認                                                            | 201 / `status=success`、`data.id` が返る。`session[:user_id]` が設定され `Set-Cookie` あり | AC-1   |
| TEST-02-02 | 重複バリデーション | 既存メールで登録した際に `VALIDATION_ERROR` が返ることを確認 | `users(:alice)` 既存       | 1) `POST /api/v1/users` に既存メールで送信 2) レスポンス確認                                                                             | 422 / `status=error`、`error.code=VALIDATION_ERROR`                                         | AC-1   |
| TEST-02-03 | ログイン成功     | 正しい認証情報でセッションが確立されることを確認            | `users(:alice)` が存在     | 1) `POST /api/v1/login` に正しいメール・パスワードで送信 2) レスポンスとセッション確認                                                   | 200 / `status=success`、`data.user.email` が返る。`session[:user_id]` がユーザーIDに設定     | AC-2   |
| TEST-02-04 | ログイン失敗     | パスワード誤りで `UNAUTHORIZED` となることを確認            | `users(:alice)` が存在     | 1) `POST /api/v1/login` に誤ったパスワードで送信                                                                                          | 401 / `status=error`、`error.code=UNAUTHORIZED`                                             | AC-2   |
| TEST-02-05 | ログアウト       | セッション破棄と Cookie クリアを確認                        | `session[:user_id]` 済み   | 1) ログイン済み状態を作る 2) `DELETE /api/v1/logout` 実行                                                                               | 200 / `status=success`、`session[:user_id]` が nil、レスポンス Cookie に有効期限切れが付与 | AC-3   |
| TEST-02-06 | `/me` 正常       | ログイン済みで現在ユーザー情報が取得できることを確認        | ログイン済み              | 1) `GET /api/v1/me` を同一セッションで実行                                                                                               | 200 / `status=success`、`data.user.id` が現在ログインユーザー                               | AC-4   |
| TEST-02-07 | `/me` 未認証     | 未ログインアクセスで `UNAUTHORIZED` が返ることを確認        | セッション未設定          | 1) Cookie なしで `GET /api/v1/me` 実行                                                                                                   | 401 / `status=error`、`error.code=UNAUTHORIZED`                                             | AC-4   |
| TEST-02-08 | リクエストテスト | 追加したリクエストテストが自動実行で成功することを確認      | テスト環境構築済み        | 1) `bin/rails test TEST=test/requests/api/v1/authentication_test.rb` を実行                                                              | 全テスト Pass                                                                                 | AC-5   |

## データセット（例）

- フィクスチャ: `users(:alice)` などメールとハッシュ済みパスワード。
- 新規登録用: `email: "user#{SecureRandom.hex(3)}@example.com"`, パスワードは 8 文字以上。
- 誤り検証用: `password: "wrongpass"`, メール大文字混在など。

## 実行コマンド例

```bash
bin/rails test TEST=test/requests/api/v1/authentication_test.rb
bin/rails test test/models/user_test.rb

# 手動確認（curl）
curl -i -c tmp/cookies -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

## 成果物

- テスト結果（Pass/Fail）を本ファイルの「検証結果」に記録する。

## 検証結果（記録用）

| 実施日     | 担当      | 結果 | メモ |
| ---------- | --------- | ---- | ---- |
| 2025/10/26 | a.kawanobe | ✅   | `/Users/a.kawanobe/.local/share/gem/ruby/3.1.0/bin/bundle _2.3.27_ exec rails test test/requests/api/v1/authentication_test.rb` を実行し全テスト成功 |

## 要確認事項（未確定・オープン）

- パスワード強度（大文字・記号必須など）やロックアウトポリシーの要否。
- SPA からの CSRF 対応（SameSite=Lax で十分か要評価）。

---
