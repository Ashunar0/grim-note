"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import RequireAuth from "@/components/RequireAuth";
import { useTimelinePosts, TimelineTab } from "@/hooks/use-timeline-posts";
import { apiClient } from "@/lib/api-client";
import type { ApiClientError } from "@/types/api";
import type { Post } from "@/types/posts";
import { useAuth } from "@/hooks/use-auth";

function useFollowingPrefetch(activeTab: TimelineTab) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (activeTab === "following" && !enabled) {
      setEnabled(true);
    }
  }, [activeTab, enabled]);

  return enabled;
}

export default function TimelinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TimelineTab>("recent");
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<number>>(new Set());
  const shouldFetchFollowing = useFollowingPrefetch(activeTab);
  const recent = useTimelinePosts("recent");
  const following = useTimelinePosts("following", shouldFetchFollowing);

  const setPendingState = (postId: number, pending: boolean) => {
    setPendingLikeIds((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(postId);
      } else {
        next.delete(postId);
      }
      return next;
    });
  };

  const toggleLike = async (post: Post, mutateFn: typeof recent.mutate) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const optimistic = (current: Post[] | undefined) =>
      current?.map((item) =>
        item.id === post.id
          ? {
              ...item,
              is_liked: !item.is_liked,
              likes_count: item.likes_count + (item.is_liked ? -1 : 1),
            }
          : item
      );

    setPendingState(post.id, true);
    mutateFn(optimistic, false);

    try {
      if (post.is_liked) {
        await apiClient.delete(`/posts/${post.id}/like`);
      } else {
        await apiClient.post(`/posts/${post.id}/like`);
      }
      await mutateFn();
    } catch (error) {
      await mutateFn();
      const apiError = error as ApiClientError;
      if (apiError.status === 401) {
        router.push("/login");
      }
    } finally {
      setPendingState(post.id, false);
    }
  };
  const renderContent = (tab: TimelineTab) => {
    const { posts, isLoading, error } = tab === "recent" ? recent : following;
    const errorMessage =
      error?.data?.error?.message ??
      (error ? "タイムラインの取得に失敗しました" : null);
    const emptyStateMessage =
      tab === "following"
        ? "フォロー中のユーザーの投稿はまだありません"
        : "投稿がまだありません";

    if (isLoading) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          読み込み中...
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="py-12 text-center text-destructive">{errorMessage}</div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          {emptyStateMessage}
        </div>
      );
    }

    return posts.map((post) => (
      <PostCard
        key={post.id}
        id={post.id.toString()}
        bookTitle={post.book?.title ?? undefined}
        author={post.book?.authors ?? undefined}
        content={post.body}
        rating={post.rating}
        tags={post.tags.map((tag) => tag.name)}
        userName={post.user.name}
        userId={post.user.id.toString()}
        likes={post.likes_count}
        isLiked={post.is_liked}
        createdAt={post.created_at}
        onToggleLike={() =>
          toggleLike(post, tab === "recent" ? recent.mutate : following.mutate)
        }
        likeDisabled={pendingLikeIds.has(post.id)}
      />
    ));
  };

  return (
    <RequireAuth>
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TimelineTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">新着</TabsTrigger>
            <TabsTrigger value="following">フォロー中</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6 space-y-4">
            {renderContent("recent")}
          </TabsContent>

          <TabsContent value="following" className="mt-6 space-y-4">
            {renderContent("following")}
          </TabsContent>
        </Tabs>

        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          asChild
        >
          <Link href="/posts/new">
            <Plus className="h-6 w-6 text-white" />
          </Link>
        </Button>
      </div>
    </RequireAuth>
  );
}
