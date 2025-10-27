"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import RequireAuth from "@/components/RequireAuth";
import { useTimelinePosts, TimelineTab } from "@/hooks/use-timeline-posts";

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
  const [activeTab, setActiveTab] = useState<TimelineTab>("recent");
  const shouldFetchFollowing = useFollowingPrefetch(activeTab);
  const recent = useTimelinePosts("recent");
  const following = useTimelinePosts("following", shouldFetchFollowing);
  const renderContent = (tab: TimelineTab) => {
    const { posts, isLoading, error } = tab === "recent" ? recent : following;
    const errorMessage =
      error?.data?.error?.message ?? (error ? "タイムラインの取得に失敗しました" : null);
    const emptyStateMessage =
      tab === "following" ? "フォロー中のユーザーの投稿はまだありません" : "投稿がまだありません";

    if (isLoading) {
      return <div className="py-12 text-center text-muted-foreground">読み込み中...</div>;
    }

    if (errorMessage) {
      return <div className="py-12 text-center text-destructive">{errorMessage}</div>;
    }

    if (posts.length === 0) {
      return <div className="py-12 text-center text-muted-foreground">{emptyStateMessage}</div>;
    }

    return posts.map((post) => (
      <PostCard
        key={post.id}
        id={post.id.toString()}
        bookTitle={post.book?.title ?? ""}
        author={post.book?.authors ?? ""}
        content={post.body}
        rating={post.rating}
        tags={post.tags.map((tag) => tag.name)}
        userName={post.user.name}
        userId={post.user.id.toString()}
        likes={post.likes_count}
        isLiked={false}
        createdAt={post.created_at}
      />
    ));
  };

  return (
    <RequireAuth>
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TimelineTab)} className="w-full">
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
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </RequireAuth>
  );
}
