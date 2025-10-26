# Grim Note システムアーキテクチャ設計（個人開発・低コスト構成）

## 技術スタック

- **フロントエンド**：Next.js / React / TypeScript / Tailwind CSS / shadcn/ui
- **バックエンド**：Ruby on Rails（API モード）
- **データベース**：PostgreSQL（Render PostgreSQL Free Tier）
- **認証**：Rails セッション Cookie（Devise または Sorcery）
- **インフラ**：

  - **Vercel**：フロントエンドホスティング（無料枠）
  - **Render**：Rails API サーバ & DB ホスティング（無料〜低額）
  - **Google Books API**：書籍データ取得
  - **Slack Webhook or Google Form**：通報受付（MVP 運用）

- **その他**：

  - Cloudflare（独自ドメイン設定・CDN 最適化）
  - GitHub Actions（自動デプロイ）

---

## システム構成図

```mermaid
graph TD
    A[ユーザー] -->|HTTP(S)| B[Next.js (Vercel)]
    B -->|API呼び出し / fetch| C[Rails API (Render)]
    C -->|SQL| D[(PostgreSQL DB)]
    C -->|APIリクエスト| E[Google Books API]
    C -->|Webhook送信| F[Slack Webhook / Google Form]
    subgraph Infra
        B
        C
        D
    end
```

---

## 選択理由

- **Next.js / React / TypeScript**
  → フロントの開発効率と保守性が高く、Vercel でデプロイが圧倒的に簡単。ISR や SSG にも対応でき、後の拡張性も ◎。

- **Tailwind CSS + shadcn/ui**
  → UI 構築を高速化。個人開発でもデザイン品質を担保できる。

- **Ruby on Rails (API モード)**
  → 認証、CRUD、バリデーション、セキュリティが標準装備。1 人開発でも安定・迅速に構築可能。

- **PostgreSQL (Render)**
  → 無料枠でも十分な性能。スキーマ設計がしやすく、Rails との親和性が高い。

- **セッション Cookie 認証**
  → Next.js × Rails 間の連携がシンプル。JWT よりも安全性と管理の簡易性を重視。

- **Render + Vercel 構成**
  → どちらも無料枠があり、CI/CD が GitHub 連携だけで自動化できる。個人開発の鉄板コンビ。

- **Slack Webhook / Google Form 通報**
  → 管理画面を作らずとも運用でき、コストゼロ。通報が届いたら Slack で即対応可能。

- **Cloudflare（任意）**
  → 無料で独自ドメイン・SSL・キャッシュ強化ができ、速度最適化も可能。

---

## 初期コスト（月額）

| サービス                    | プラン        | 月額      |
| --------------------------- | ------------- | --------- |
| Vercel                      | Hobby（無料） | $0        |
| Render（Rails API）         | Free Tier     | $0        |
| Render（PostgreSQL）        | Free Tier     | $0        |
| Google Books API            | 無料          | $0        |
| Slack Webhook / Google Form | 無料          | $0        |
| Cloudflare                  | Free          | $0        |
| **合計**                    |               | **$0/月** |

---

## 💬 コメント：開発・運用のリアル感

- デプロイは GitHub push で自動。サーバーメンテ不要。
- バックエンドは Render で Sleep モード時に若干起動待ちあり（数秒）だが、無料枠では許容範囲。
- モニタリングは Sentry などを後付けできるが、最初は不要。
- ストレージ・画像なし構成なので維持費ゼロ。
