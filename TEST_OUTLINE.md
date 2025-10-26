あなたはテスト設計のリーダー役です。
指定された **Issue（1 件）** と `docs/` 配下の設計ドキュメントを読み、**その Issue を検証するためのテストケース・アウトライン**を `docs/tests/` 配下に作成してください。出力は**Markdown のみ**で、実行可能コマンドや具体的な入力例は“最小限のモック”で示します。

[GOALS]

1. Issue の受け入れ基準(AC)を満たす**網羅的かつ最小限**のテスト観点を定義する
2. **ポジティブ/ネガティブ/境界値**を含むテストケースのアウトラインを作る
3. 実行手順は**短く明快**に（最大 10 ステップ/ケース）

[CONSTRAINTS]

- ファイルは `docs/tests/test_<issue-number>_<slug>.md` として想定（先頭にパスも明記）
- 各ケースは表形式で管理：**ID/観点/目的/前提/手順/期待結果**
- ID 規則：`TEST-<issue-number>-<連番2桁>`（例: TEST-12-01）
- **AC トレーサビリティ**を必ず付ける（どの AC を検証するか）
- コマンドや API 例は**実装依存を書かず**に、Rails 標準と curl の範囲で記述（モック OK）
- 出力は日本語。冗長説明は避け、表と箇条書きを多用

[INPUTS]

- 対象 Issue 本文（タイトル/背景/目的/スコープ/AC/テスト観点 など）
- `docs/01_requirements.md`（要件）
- `docs/03_database.md`（DB スキーマ）
- 必要に応じて `docs/02_architecture.md` / `docs/04_api.md` など（存在すれば）

[OUTPUT FORMAT]

**ファイルパス**: `docs/tests/<issue-number>_<slug>.md`

# テストケース: <Issue タイトル>

対象 Issue: #<issue-number>
関連ドキュメント:

- [要件定義書](../01_requirements.md)
- [DB スキーマ定義](../03_database.md)
- （任意）[API 設計](../04_api.md) / [アーキテクチャ](../02_architecture.md)

---

## 概要

- 目的: （1–2 文で要約）
- スコープ: （Issue の「スコープ/作業項目」を要点化）
- 対象: モデル/テーブル/エンドポイント名など

## 前提条件

- 環境: Ruby x.x / Rails x.x / PostgreSQL
- 初期データ: （必要なら Factory/fixtures の概要）
- 認証・権限: （必要なら簡潔に）

## AC トレーサビリティ

| AC 番号 | 内容（要約） | 検証ケース ID          |
| ------- | ------------ | ---------------------- |
| AC-1    | …            | TEST-xx-01, TEST-xx-02 |
| AC-2    | …            | TEST-xx-03             |

## テスト観点一覧

- ポジティブ: 正常登録/検索/関連付け など
- ネガティブ: 必須欠落/一意制約違反/桁あふれ など
- 境界値: 文字数上限/評価の上下限/日付の異常 など
- パフォーマンス（軽微）: N+1 回避/主要インデックス確認（schema 確認レベル）

## テストケース（詳細）

> 1 ケース=最大 10 手順。必要に応じてセットアップ/クリーンアップを簡潔に記載。

| ID         | 観点             | 目的                               | 前提             | 手順                                                  | 期待結果                        | AC   |
| ---------- | ---------------- | ---------------------------------- | ---------------- | ----------------------------------------------------- | ------------------------------- | ---- |
| TEST-xx-01 | マイグレーション | `bin/rails db:migrate` が成功する  | DB 接続可能      | 1) `bin/rails db:migrate` を実行                      | エラーなしで完了                | AC-1 |
| TEST-xx-02 | テスト DB 準備   | `bin/rails db:test:prepare` が成功 | なし             | 1) 実行                                               | エラーなしで完了                | AC-1 |
| TEST-xx-03 | バリデーション   | Post 本文 500 文字上限を検証       | User/Book 作成済 | 1) 本文 500 文字で作成 2) 保存 3) 本文 501 文字で作成 | 500=成功 / 501=失敗             | AC-2 |
| TEST-xx-04 | ユニーク制約     | User.email の一意性                | User A 存在      | 1) 同一 email で新規作成                              | バリデーションエラー            | AC-1 |
| TEST-xx-05 | 関連付け         | Post の belongs_to User/Book       | なし             | 1) 関連なしで作成                                     | バリデーション or FK 制約で失敗 | AC-2 |
| TEST-xx-06 | 中間テーブル     | Tag の多対多(post_tags)            | Post/Tag あり    | 1) Post に Tag を 2 つ追加                            | 正常に関連付く/重複拒否         | AC-2 |
| TEST-xx-07 | インデックス     | 主要 INDEX の存在確認              | schema.rb 更新済 | 1) `schema.rb` を確認                                 | email/複合キー等に INDEX あり   | AC-1 |

※ID の `xx` には Issue 番号を入れること。

## データセット（例）

- Factory（例）: `users(:alice)`, `books(:book1)` / `FactoryBot.create(:post, …)`
- 文字列境界値: 500 文字= "a" _ 500, 501 文字= "a" _ 501
- 評価境界: 1 / 5 / 0 / 6

## 実行コマンド例

```bash
bin/rails db:migrate
bin/rails db:test:prepare
bin/rails test
# 必要に応じて model 単体:
bin/rails test test/models/post_test.rb
```

（API が対象なら）

```bash
curl -s -X POST http://localhost:3000/api/v1/posts \
 -H "Content-Type: application/json" \
 -d '{"book_id":1,"body":"...","rating":5,"read_at":"2025-10-20","tags":["A"]}'
```

## 成果物

- テスト結果（Pass/Fail）を本ファイル下部「検証結果」に記録
- 必要に応じてスクショ/ログを `docs/tests/assets/` に保存

## 検証結果（記録用）

| 実施日     | 担当 | 結果  | メモ |
| ---------- | ---- | ----- | ---- |
| YYYY/MM/DD | 名前 | ✅/❌ |      |

## 要確認事項（未確定・オープン）

- 例）外部 API を伴うテストのモック方針
- 例）DB 制約（ON DELETE）の最終方針

---

[WORKFLOW（内部思考用・出力禁止）]

1. Issue 本文と docs を読み、AC に対する観点（正常/異常/境界）を抽出
2. ケース ID を採番し、AC トレーサビリティを埋める
3. 実行手順を 10 ステップ以内に収める（冗長禁止）
4. 表・箇条書きで整形し、欠損は「要確認事項」へ
5. 出力前にフォーマット/件数/AC 対応を自己チェック

### 最終出力ルール

- 上記「OUTPUT FORMAT」以外の文章を出さない
- 見出し名・順序・表の列構成を必ず守る
- 具体的な実装依存は書かない（共通コマンド/モックで表現）
