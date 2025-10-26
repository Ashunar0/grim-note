### 背景 / 目的
docs/03_database.md で定義されたスキーマを実際のテーブルとモデルに落とし込み、docs/01_requirements.md の MVP を支えるデータ基盤を整える。

- 依存: -
- ラベル: backend

### スコープ / 作業項目
- users・books・posts・tags・post_tags・likes・follows のマイグレーション作成と実行
- 各 ActiveRecord モデルの関連付けと主要バリデーション（例: 文字数・ユニーク制約）の実装
- モデルスペック／リクエストテストで利用するための Factory もしくは fixture の整備
- `bin/rails db:migrate` および `bin/rails db:test:prepare` の確認とドキュメント更新（必要時）

### ゴール / 完了条件（Acceptance Criteria）
- [ ] users・books・posts・tags・post_tags・likes・follows テーブルを定義し、必須制約とインデックスを付与する
- [ ] 各モデルに関連付けと基本バリデーション（例: Post 本文 500 文字制限）を実装する
- [ ] `bin/rails db:migrate` と `bin/rails db:test:prepare` が通る
- [ ] 更新された `schema.rb` とモデルがレビュー可能な状態で提示される

### テスト観点
- ユニット（モデル）
- 検証方法: `bin/rails test` でモデルバリデーションを確認し、`bin/rails db:migrate` と `bin/rails db:test:prepare` が成功することを確認
