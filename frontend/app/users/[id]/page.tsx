"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { mutate as mutateGlobal } from "swr";
import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";
import { useProfile } from "@/hooks/use-profile";
import { apiClient } from "@/lib/api-client";
import type { ApiClientError } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";

type UserProfilePageProps = {
  params: { id: string };
};

const LOGIN_PATH = "/login";

const ErrorMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="py-12 text-center text-destructive">{children}</div>
);

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const userId = Number(params.id);
  const router = useRouter();
  const { user } = useAuth();
  const [followLoading, setFollowLoading] = useState(false);
  const idParam = Number.isNaN(userId) ? params.id : userId;
  const { profile, isLoading, error, mutate } = useProfile(idParam);

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

  const handleToggleFollow = async () => {
    if (!profile || profile.is_self) return;
    if (!user) {
      router.push(LOGIN_PATH);
      return;
    }

    setFollowLoading(true);

    try {
      if (profile.is_following) {
        await apiClient.delete(`/users/${profile.id}/follow`);
      } else {
        await apiClient.post(`/users/${profile.id}/follow`);
      }

      await mutate();
      await mutateGlobal(["timeline", "following"]);
    } catch (err) {
      const apiError = err as ApiClientError;
      if (apiError.status === 401) {
        router.push(LOGIN_PATH);
      }
    } finally {
      setFollowLoading(false);
    }
  };

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
          onToggleFollow={profile.is_self ? undefined : handleToggleFollow}
          followDisabled={followLoading}
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
