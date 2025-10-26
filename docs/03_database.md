# データベース設計（Grim Note）

---

## テーブル一覧

- **users**: ユーザー情報（認証・プロフィール）を管理
- **books**: Google Books API で取得または手入力した書籍情報を保存
- **posts**: ユーザーの感想投稿（本文・評価・読了日など）
- **tags**: 投稿に紐づくタグ（重複防止のため正規化）
- **post_tags**: 投稿とタグの中間テーブル
- **likes**: 投稿への「いいね」
- **follows**: ユーザー同士のフォロー関係

> 🧩 将来的に追加しやすいように、`comments`・`reports`・`notifications` は未実装だが拡張を想定した設計。

---

## 主要テーブル DDL

### users テーブル

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  bio TEXT,
  icon_url TEXT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_digest VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### books テーブル

```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  google_books_id VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  authors TEXT,
  isbn13 VARCHAR(20),
  published_year INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### posts テーブル

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT,
  body VARCHAR(500) NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  read_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
);
```

### tags テーブル

```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);
```

### post_tags テーブル

```sql
CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### likes テーブル

```sql
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### follows テーブル

```sql
CREATE TABLE follows (
  follower_id INT NOT NULL,
  followee_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## リレーション

- **posts.user_id → users.id**
  投稿したユーザーとの関連

- **posts.book_id → books.id**
  投稿対象の書籍との関連

- **post_tags.post_id → posts.id**
  **post_tags.tag_id → tags.id**
  投稿とタグの多対多関係

- **likes.user_id → users.id**
  **likes.post_id → posts.id**
  投稿への「いいね」

- **follows.follower_id → users.id**
  **follows.followee_id → users.id**
  フォロー関係（ユーザー同士の多対多）

---

## 💡 設計メモ／補足

- **正規化レベル**：第 3 正規形を維持しつつ、操作性重視の最小構成。
- **スキーマの柔軟性**：

  - `books` は Google Books ID ベースで管理するため、将来的に外部 API 切り替えが容易。
  - `tags` は重複防止用でシンプルなユニーク制約のみ。

- **削除ポリシー**：

  - `ON DELETE CASCADE` を基本採用（孤立データ防止）。
  - 書籍削除時のみ `SET NULL`（複数投稿で共有される可能性があるため）。

- **拡張予定フィールド**：

  - `users` に `is_admin`（運営判定）
  - `posts` に `visibility`（公開範囲：公開／フォロワー限定）
  - `books` に `thumbnail_url`（表紙追加時用）

---

✅ **この構成の特徴**

- テーブル数：**6**（最小限）
- 多対多関係：`post_tags`, `follows` のみ
- 外部キー整合性：維持（CASCADE 設計）
- 拡張性：高（コメント・通報・通知を後付けできる）
- 個人開発向き：Rails の`scaffold`＋`belongs_to / has_many`構成でそのまま構築可能
