import type { PostBook, PostTag } from "./posts";

export type ProfilePost = {
  id: number;
  body: string;
  rating: number;
  read_at: string | null;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  book: PostBook | null;
  tags: PostTag[];
};

export type Profile = {
  id: number;
  name: string;
  bio: string | null;
  icon_url: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  is_self: boolean;
  is_following: boolean;
  posts: ProfilePost[];
};
