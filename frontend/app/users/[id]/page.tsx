"use client";

import Link from "next/link";
import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";
import { useProfile } from "@/hooks/use-profile";

type UserProfilePageProps = {
  params: { id: string };
};

const LOGIN_PATH = "/login";

const ErrorMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="py-12 text-center text-destructive">{children}</div>
);

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const userId = Number(params.id);
  const { profile, isLoading, error } = useProfile(Number.isNaN(userId) ? params.id : userId);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="py-12 text-center text-muted-foreground">
          読み込み中です...
        </div>
      </div>
    );
  }

  if (error) {
    if (error.status === 401) {
      return (
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <ErrorMessage>
            プロフィールを表示するにはログインが必要です。
            <div className="mt-4">
              <Link href={LOGIN_PATH} className="text-primary underline">
                ログインページへ移動
              </Link>
            </div>
          </ErrorMessage>
        </div>
      );
    }

    const message =
      error.data?.error?.message ?? "プロフィールの取得に失敗しました";
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <ErrorMessage>{message}</ErrorMessage>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <ErrorMessage>プロフィールが見つかりませんでした</ErrorMessage>
      </div>
    );
  }

  const posts = profile.posts ?? [];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="space-y-6">
        <ProfileHeader
          userId={profile.id}
          userName={profile.name}
          bio={profile.bio ?? undefined}
          avatar={profile.icon_url ?? undefined}
          isOwnProfile={profile.is_self}
          isFollowing={profile.is_following}
          followerCount={profile.follower_count}
          followingCount={profile.following_count}
          postCount={profile.post_count}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-bold">投稿一覧</h2>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id.toString()}
                bookTitle={post.book?.title ?? undefined}
                author={post.book?.authors ?? undefined}
                content={post.body}
                rating={post.rating}
                tags={post.tags.map((tag) => tag.name)}
                userName={profile.name}
                userAvatar={profile.icon_url ?? undefined}
                userId={profile.id.toString()}
                likes={post.likes_count}
                isLiked={post.is_liked}
                createdAt={post.created_at}
              />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              まだ投稿がありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
