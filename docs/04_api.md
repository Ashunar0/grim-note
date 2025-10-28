# REST API 設計（Grim Note）

---

## 共通仕様

### ベース URL

```
/api/v1/
```

### 共通レスポンス形式

成功・失敗問わず、**JSON 形式**で返す。

#### ✅ 成功時

```json
{
  "status": "success",
  "data": { ... }
}
```

#### ❌ 失敗時

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "本文は必須です"
  }
}
```

### 主なエラーコード

| コード             | 意味                         |
| ------------------ | ---------------------------- |
| `UNAUTHORIZED`     | 認証エラー（ログインが必要） |
| `NOT_FOUND`        | 対象データが存在しない       |
| `VALIDATION_ERROR` | バリデーションエラー         |
| `FORBIDDEN`        | 権限がない操作               |
| `SERVER_ERROR`     | サーバ内部エラー             |

---

## ユーザー関連

### POST /api/v1/users

**認証**: 不要
**説明**: 新規ユーザー登録

#### リクエスト例

```bash
curl -X POST https://yomuplus.app/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "あさひ",
    "email": "asahi@example.com",
    "password": "password123"
  }'
```

#### レスポンス例

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "あさひ",
    "email": "asahi@example.com"
  }
}
```

**エラー**:

- `VALIDATION_ERROR` 名前やメールが未入力
- `SERVER_ERROR` DB 登録失敗

---

### POST /api/v1/login

**認証**: 不要
**説明**: メール・パスワードによるログイン（セッション Cookie 発行）

#### リクエスト例

```bash
curl -X POST https://yomuplus.app/api/v1/login \
  -d '{
    "email": "asahi@example.com",
    "password": "password123"
  }'
```

#### レスポンス例

```json
{
  "status": "success",
  "data": {
    "user": { "id": 1, "name": "あさひ" }
  }
}
```

**エラー**:

- `UNAUTHORIZED` メールまたはパスワードが不正

---

### GET /api/v1/users/:id

**認証**: 必要
**説明**: 指定ユーザーのプロフィール情報と投稿一覧を取得

#### レスポンス例

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "name": "読書太郎",
    "bio": "ミステリー好きです。",
    "icon_url": null,
    "posts": [
      {
        "id": 12,
        "book": { "title": "ノルウェイの森", "author": "村上春樹" },
        "rating": 5,
        "body": "心情描写が深い…",
        "created_at": "2025-10-25T08:30:00Z"
      }
    ]
  }
}
```

---

## 書籍関連

### GET /api/v1/books/search

**認証**: 必要
**説明**: Google Books API を利用した書籍検索

#### リクエスト例

```bash
curl "https://yomuplus.app/api/v1/books/search?q=君の名は"
```

#### レスポンス例

```json
{
  "status": "success",
  "data": [
    {
      "google_books_id": "xyz123",
      "title": "君の名は。",
      "authors": "新海誠",
      "isbn13": "9784041026229",
      "published_year": 2016
    }
  ]
}
```

**エラー**:

- `SERVER_ERROR` Google Books API 呼び出し失敗

**環境変数**:

開発・本番環境で Google Books API を利用するには、事前に `GOOGLE_BOOKS_API_KEY` を設定してください（例: `export GOOGLE_BOOKS_API_KEY="your-api-key"`）。

---

## 投稿関連

### GET /api/v1/posts

**認証**: 不要
**説明**: 新着タイムラインを取得（クエリでフォロー中も可）

#### リクエスト例

```bash
curl "https://yomuplus.app/api/v1/posts?tab=new&page=1"
```

#### レスポンス例

```json
{
  "status": "success",
  "data": [
    {
      "id": 101,
      "user": { "id": 3, "name": "読書太郎" },
      "book": { "title": "ハリーポッターと賢者の石" },
      "rating": 4,
      "body": "何度読んでもワクワクする",
      "created_at": "2025-10-24T12:00:00Z",
      "likes_count": 3
    }
  ]
}
```

---

### POST /api/v1/posts

**認証**: 必要
**説明**: 書籍に紐づく投稿を作成

#### リクエスト例

```bash
curl -X POST https://yomuplus.app/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "body": "感想本文500文字まで",
    "rating": 5,
    "read_at": "2025-10-20",
    "tags": ["哲学", "自己啓発"]
  }'
```

#### レスポンス例

```json
{
  "status": "success",
  "data": {
    "id": 45,
    "book_id": 1,
    "body": "感想本文500文字まで",
    "rating": 5,
    "read_at": "2025-10-20",
    "tags": ["哲学", "自己啓発"]
  }
}
```

**エラー**:

- `VALIDATION_ERROR` 本文または評価未入力
- `UNAUTHORIZED` 認証切れ

---

### DELETE /api/v1/posts/:id

**認証**: 必要
**説明**: 自分の投稿を削除

#### レスポンス例

```json
{
  "status": "success",
  "message": "投稿を削除しました"
}
```

**エラー**:

- `FORBIDDEN` 他人の投稿は削除不可

---

## いいね関連

### POST /api/v1/posts/:id/like

**認証**: 必要
**説明**: 投稿に「いいね」を付与（既にいいね済みの場合は `200 OK` で状態維持）

#### レスポンス例 (201 Created)

```json
{
  "status": "success",
  "data": {
    "id": 42,
    "body": "読了メモ",
    "rating": 5,
    "read_at": "2025-10-20",
    "created_at": "2025-10-21T12:34:56Z",
    "likes_count": 12,
    "is_liked": true,
    "user": { "id": 3, "name": "Alice" },
    "book": {
      "id": 10,
      "title": "ノルウェイの森",
      "authors": "村上春樹",
      "published_year": 1987
    },
    "tags": [
      { "id": 1, "name": "文学" },
      { "id": 2, "name": "日本" }
    ]
  }
}
```

**エラー**:

- `NOT_FOUND` 指定した投稿が存在しない
- `UNAUTHORIZED` 未ログイン（セッション切れ）

---

### DELETE /api/v1/posts/:id/like

**認証**: 必要
**説明**: 「いいね」を取り消し

#### レスポンス例 (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 42,
    "likes_count": 11,
    "is_liked": false,
    "user": { "id": 3, "name": "Alice" },
    "book": {
      "id": 10,
      "title": "ノルウェイの森",
      "authors": "村上春樹",
      "published_year": 1987
    },
    "body": "読了メモ",
    "rating": 5,
    "read_at": "2025-10-20",
    "created_at": "2025-10-21T12:34:56Z",
    "tags": [
      { "id": 1, "name": "文学" },
      { "id": 2, "name": "日本" }
    ]
  }
}
```

**エラー**:

- `NOT_FOUND` 指定した投稿が存在しない
- `UNAUTHORIZED` 未ログイン（セッション切れ）

---

## フォロー関連

### POST /api/v1/users/:id/follow

**認証**: 必要
**説明**: 指定ユーザーをフォロー

#### レスポンス例 (201 Created)

```json
{
  "status": "success",
  "data": {
    "user_id": 3,
    "follower_count": 42,
    "following_count": 12,
    "is_following": true
  }
}
```

**エラー**:

- `INVALID_OPERATION` 自分自身をフォローしようとした
- `NOT_FOUND` ユーザーが存在しない
- `UNAUTHORIZED` 未ログイン

---

### DELETE /api/v1/users/:id/follow

**認証**: 必要
**説明**: 指定ユーザーのフォローを解除

#### レスポンス例 (200 OK)

```json
{
  "status": "success",
  "data": {
    "user_id": 3,
    "follower_count": 41,
    "following_count": 11,
    "is_following": false
  }
}
```

**エラー**:

- `NOT_FOUND` ユーザーが存在しない
- `UNAUTHORIZED` 未ログイン

---

## タグ関連

### GET /api/v1/tags

**認証**: 不要
**説明**: 登録済みタグ一覧（将来サジェスト対応予定）

#### レスポンス例

```json
{
  "status": "success",
  "data": [
    { "id": 1, "name": "ミステリー" },
    { "id": 2, "name": "自己啓発" }
  ]
}
```

---

## 通報関連（フォーム版）

### POST /api/v1/reports

**認証**: 不要
**説明**: 不適切な投稿を報告（MVP では Slack または Google Form へ転送）

#### リクエスト例

```bash
curl -X POST https://yomuplus.app/api/v1/reports \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 123,
    "reason": "不適切な表現が含まれています"
  }'
```

#### レスポンス例

```json
{
  "status": "success",
  "message": "報告を受け付けました"
}
```

---

## ✅ 補足メモ

- 認証セッションは Rails で管理（CSRF 対策あり）
- エラーはすべて共通フォーマット `{status, error}`
- ページング：`?page=` クエリで対応
- `created_at`/`updated_at`は ISO8601 で統一
- **Next.js 側は SWR または React Query**でフェッチ推奨

---
