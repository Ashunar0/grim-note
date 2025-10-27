export type PostTag = {
  id: number;
  name: string;
};

export type PostUser = {
  id: number;
  name: string;
};

export type PostBook = {
  id: number;
  title: string;
  authors: string | null;
  published_year: number | null;
};

export type Post = {
  id: number;
  body: string;
  rating: number;
  read_at: string | null;
  created_at: string;
  likes_count: number;
  user: PostUser;
  book: PostBook | null;
  tags: PostTag[];
};

export type PostCreateResponse = {
  id: number;
  book_id: number | null;
  body: string;
  rating: number;
  read_at: string | null;
  tags: string[];
};
