**ファイルパス**: `docs/tests/test_6_google-books-search-service.md`

# テストケース: Google Books 検索サービス実装

対象 Issue: #6  
関連ドキュメント:

- [要件定義書](../01_requirements.md)
- [API 設計](../04_api.md)
- [アーキテクチャ](../02_architecture.md)

---

## 概要

- 目的: Google Books API 連携サービスと `/api/v1/books/search` エンドポイントが仕様どおり動作するか検証する。
- スコープ: サービスクラスの外部 API 呼び出し、レスポンス正規化、エラーハンドリング、環境変数参照、リクエストテスト。
- 対象: `GoogleBooks::SearchService`（仮）、`BooksController#search`、API キー設定。

## 前提条件

- 環境: Ruby 3.1.6 / Rails 7.2。
- API キー: `GOOGLE_BOOKS_API_KEY` を `.env` や credentials に設定。
- テスト: WebMock/VCR 等で Google Books API をスタブする。

## AC トレーサビリティ

| AC 番号 | 内容（要約）                                                                          | 検証ケース ID                |
| ------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| AC-1    | サービスが Google Books API を呼び出し正規化したフィールド(title/authors/isbn13等)を返す | TEST-06-01, TEST-06-02       |
| AC-2    | `/books/search` が `q` 必須で結果を返し、0 件時は空配列                               | TEST-06-03, TEST-06-04       |
| AC-3    | 失敗時に `SERVER_ERROR` を返しログへ出力                                             | TEST-06-05                   |
| AC-4    | API キーを環境変数から取得し、設定手順をドキュメント化                               | TEST-06-06                   |

## テスト観点一覧

- ポジティブ: 有効なクエリで結果が返る。
- ネガティブ: `q` 欠落、外部 API エラー（タイムアウト/500）。
- データ整形: ISBN13 欠損時のハンドリング、複数著者。
- パフォーマンス: レスポンス件数制限（必要に応じて 10 件など）。

## テストケース（詳細）

| ID         | 観点               | 目的                                                          | 前提                          | 手順                                                                                                                                     | 期待結果                                                                                              | AC   |
| ---------- | ------------------ | ------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---- |
| TEST-06-01 | サービス正常       | サービスクラスが外部 API を呼び出し正規化データを返す確認     | WebMock で API 応答を定義     | 1) `GoogleBooks::SearchService.call("ノルウェイの森")` を実行 2) 返却値のキーと値を検証                                                   | title/authors/isbn13/published_year が整形されて返る                                                   | AC-1 |
| TEST-06-02 | データ整形         |  authors 複数・ISBN 欠損などの整形処理を確認                 | 欠損ケースのモック応答を用意   | 1) 欠損値を含むレスポンスをモック 2) サービス呼び出し結果を確認                                                                          | 欠損時は nil/空文字で返り、例外が発生しない                                                           | AC-1 |
| TEST-06-03 | クエリ必須         | `q` パラメータ必須を検証                                      | リクエストテスト構築済み       | 1) `GET /api/v1/books/search` を `q` なしで実行 2) ステータス/メッセージ確認                                                             | 400 or 422 / `status=error`、メッセージにパラメータ不足                                                | AC-2 |
| TEST-06-04 | 0件応答            | 0 件時に空配列を返すことを確認                                | 空配列のモック応答を用意       | 1) `GET /api/v1/books/search?q=zzz` を実行                                                                                               | 200 / `data` が空配列                                                                                   | AC-2 |
| TEST-06-05 | 外部エラー         | 外部 API 失敗時に `SERVER_ERROR` が返りログ出力されるか確認   | 500 応答をモック               | 1) `GET /api/v1/books/search?q=fail` で 500 を返す 2) レスポンスとログを確認                                                             | 500 / `error.code=SERVER_ERROR`、Rails ログにエラー内容が出力                                           | AC-3 |
| TEST-06-06 | 環境変数設定       | API キー読み込みと設定手順がドキュメントに反映されている確認   | README/ドキュメント更新済み    | 1) README/AGENTS を確認し `GOOGLE_BOOKS_API_KEY` の設定手順が記載 2) 設定がない状態で警告が出るかテスト                                  | ドキュメント記載があり、キー未設定時に例外または分かりやすいエラーメッセージ                         | AC-4 |

## データセット（例）

- WebMock stub: `https://www.googleapis.com/books/v1/volumes?q=...&key=...`
- 代表レスポンス JSON（`items` 配列）を `test/fixtures/files/google_books_success.json` 等で管理。
- エラー応答: HTTP 500 / Timeout をスタブ。

## 実行コマンド例

```bash
bin/rails test TEST=test/services/google_books/search_service_test.rb
bin/rails test TEST=test/requests/api/v1/books_search_test.rb
```

## 成果物

- テスト実行結果を「検証結果」に記録し、必要に応じて外部 API モックファイルを添付。

## 検証結果（記録用）

| 実施日     | 担当 | 結果 | メモ |
| ---------- | ---- | ---- | ---- |
| YYYY/MM/DD |      | ✅/❌ |      |

## 要確認事項（未確定・オープン）

- Google Books API のレート制限対策（キャッシュ・バックオフ）。
- API キー不要モード（テスト/ローカル）をどう扱うか。

---
