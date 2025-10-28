**ファイルパス**: `docs/tests/test_13_report-form-and-contact-api.md`

# テストケース: 通報フォームとお問い合わせ API

対象 Issue: #13  
関連ドキュメント:

- [要件定義書](../01_requirements.md)
- [API 設計](../04_api.md)
- [サイトマップ](../05_sitemap.md)

---

## 概要

- 目的: 通報 API とフロントフォームが Slack/Webhook 連携を行い、送信中/成功/失敗の UI を提供することを確認する。
- スコープ: `POST /api/v1/reports`、外部通知ロジック、`/contact` ページ、投稿詳細の通報導線。
- 対象: ReportsController（仮）、サービスクラス（Slack/Google Form）、Next.js お問い合わせページ。

## 前提条件

- 環境: Ruby 3.1.6 / Rails 7.2 / Node 20 / Next.js 13。
- 外部連携: Slack Webhook URL または Google Form エンドポイントをスタブ。
- 認証: 不要（通報は未認証でも可能想定）。

## AC トレーサビリティ

| AC 番号 | 内容（要約）                                                                    | 検証ケース ID                    |
| ------- | ------------------------------------------------------------------------------- | -------------------------------- |
| AC-1    | `/reports` が post_id・category・message を受け取り、Slack/Google Form へ連携   | TEST-13-01, TEST-13-02           |
| AC-2    | 成功時に成功レスポンス、失敗時に `SERVER_ERROR` とユーザー向けエラーメッセージ | TEST-13-03                       |
| AC-3    | `/contact` が API を呼び出し送信中インジケータと完了メッセージを表示           | TEST-13-04, TEST-13-05           |
| AC-4    | `/posts/:id` 通報ボタンから `?postId=` 付きで遷移時にフォームが自動入力        | TEST-13-06                       |

## テスト観点一覧

- ポジティブ: 正常送信→Slack/Webhook 連携成功。
- ネガティブ: 外部連携失敗時のエラーハンドリング、必須項目欠落。
- UX: 送信中のボタン disable、成功メッセージ、エラー表示。
- 導線: 投稿詳細→お問い合わせフォームの引数受け渡し。

## テストケース（詳細）

| ID         | 観点               | 目的                                                                       | 前提                                         | 手順                                                                                                                                       | 期待結果                                                                                         | AC   |
| ---------- | ------------------ | -------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---- |
| TEST-13-01 | API 正常送信       | `/api/v1/reports` が Slack/Webhook へ payload を送るか確認                 | WebMockで Webhook エンドポイントをスタブ      | 1) `POST /api/v1/reports` に `post_id/category/message` を送信 2) 外部リクエストが行われたか確認                                            | 200 / `status=success`、WebHook に正しい JSON が送信                                            | AC-1 |
| TEST-13-02 | パラメータ検証     | 必須項目欠落時にバリデーションエラーを返すか確認                          | -                                            | 1) `category` なしで送信                                                                                                                  | 422 / `VALIDATION_ERROR`                                                                         | AC-1 |
| TEST-13-03 | 外部連携失敗       | 外部 API 失敗時に `SERVER_ERROR` を返しユーザー向けメッセージ表示を確認   | WebHook を 500 応答にスタブ                   | 1) `POST /reports` 実行 2) レスポンスとログを確認                                                                                          | 500 / `error.code=SERVER_ERROR`、ログ記録                                                       | AC-2 |
| TEST-13-04 | フォーム送信中     | `/contact` ページで送信中インジケータ・ボタン disable が機能するか確認    | Next.js ページにアクセス                     | 1) フォーム入力→送信 2) 送信中の状態（スピナー/disable）を確認                                                                            | 送信中はボタンが disable。成功後に成功メッセージ                                                | AC-3 |
| TEST-13-05 | フォームエラー表示 | API 失敗時にエラー表示と再送可能状態になるか確認                          | API を 500 にモック                           | 1) フォーム送信 2) エラーメッセージとボタン再有効化を確認                                                                                | エラーメッセージ表示、再入力→再送信可能                                                        | AC-3 |
| TEST-13-06 | 通報導線           | 投稿詳細の通報ボタンから遷移時に `postId` が自動入力されるか確認          | `/posts/:id` ページにボタンを設置            | 1) 通報ボタン押下→`/contact?postId=xxx` へ遷移 2) フォームの `post_id` フィールドが初期値としてセット                                     | 対象 Post ID がフォームで事前入力                                                               | AC-4 |

## データセット（例）

- WebHook スタブ: `https://hooks.slack.com/services/...` など。
- 投稿 ID: `posts(:alice_post)`。
- カテゴリ: `report`, `bug`, `feedback` など。

## 実行コマンド例

```bash
bin/rails test TEST=test/requests/api/v1/reports_test.rb
npm run test        # フロントフォームの単体テスト
npm run test:e2e    # 通報導線の E2E
```

## 成果物

- テスト結果を「検証結果」に記録。外部連携ログを保存する場合はマスク処理。

## 検証結果（記録用）

| 実施日     | 担当 | 結果 | メモ |
| ---------- | ---- | ---- | ---- |
| 2025/10/28 | a.kawanobe | ✅ | `bundle _2.3.27_ exec rails test TEST=test/requests/api/v1/reports_test.rb` / `npm run lint` / `npm run typecheck` / `npm run test -- --run` |

## 要確認事項（未確定・オープン）

- Slack と Google Form の両対応にするか、環境ごとに切り替えるか。
- スパム対策（rate limit, CAPTCHA）導入有無。

---
