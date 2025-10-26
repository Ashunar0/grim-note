"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { apiClient } from "@/lib/api-client";

type TimelinePost = {
  id: number;
  body: string;
  rating: number;
  read_at: string | null;
  created_at: string;
  likes_count: number;
  user: {
    id: number;
    name: string;
  };
  book: {
    id: number;
    title: string;
    authors: string | null;
    published_year: number | null;
  } | null;
  tags: { id: number; name: string }[];
};

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState("recent");
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<{
          status: string;
          data: TimelinePost[];
        }>("/posts", {
          params: activeTab === "following" ? { tab: "following" } : undefined,
        });
        setPosts(response.data);
      } catch (err: any) {
        setError(err?.data?.error?.message ?? "タイムラインの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab]);

  return (
    <RequireAuth>
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">新着</TabsTrigger>
            <TabsTrigger value="following">フォロー中</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">読み込み中...</div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">{error}</div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
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
                />
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground">投稿がまだありません</div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-6 space-y-4">
            <div className="py-12 text-center text-muted-foreground">
              フォロー中のユーザーの投稿はまだありません
            </div>
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
