"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, User, Flag, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import RatingStars from "@/components/RatingStars";
import RequireAuth from "@/components/RequireAuth";
import { usePostDetail } from "@/hooks/use-post-detail";
import { formatDateTime } from "@/lib/date";
import { apiClient } from "@/lib/api-client";
import type { ApiClientError } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";

type PostDetailPageProps = {
  params: {
    id: string;
  };
};

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const { post, error, isLoading, mutate } = usePostDetail(params.id);
  const isNotFound = error?.status === 404;
  const errorMessage =
    error && !isNotFound
      ? error.data?.error?.message ?? "投稿の取得に失敗しました"
      : null;

  const handleToggleLike = async () => {
    if (!post) return;
    if (!user) {
      router.push("/login");
      return;
    }

    setIsLiking(true);

    try {
      if (post.is_liked) {
        await apiClient.delete(`/posts/${post.id}/like`);
      } else {
        await apiClient.post(`/posts/${post.id}/like`);
      }
      await mutate();
    } catch (err) {
      const apiError = err as ApiClientError;
      if (apiError.status === 401) {
        router.push("/login");
      }
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <RequireAuth>
      <div className="container mx-auto max-w-3xl px-4 py-6">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">読み込み中...</div>
        ) : isNotFound ? (
          <Card>
            <CardContent className="space-y-4 py-10 text-center">
              <p className="text-lg font-semibold">投稿が見つかりませんでした。</p>
              <p className="text-sm text-muted-foreground">
                削除されたか、URL が正しくない可能性があります。
              </p>
              <Button asChild>
                <Link href="/timeline">タイムラインへ戻る</Link>
              </Button>
            </CardContent>
          </Card>
        ) : errorMessage ? (
          <div className="py-12 text-center text-destructive">{errorMessage}</div>
        ) : post ? (
          <Card>
            <CardHeader className="space-y-4">
              <Link href={`/users/${post.user.id}`} className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt={post.user.name} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium hover:underline">{post.user.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(post.created_at)}</p>
                </div>
              </Link>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex h-20 w-14 items-center justify-center rounded bg-muted">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h1 className="text-2xl font-bold">
                      {post.book?.title ?? "書籍情報未登録"}
                    </h1>
                    {post.book?.authors && (
                      <p className="text-sm text-muted-foreground">{post.book.authors}</p>
                    )}
                    {post.book?.published_year && (
                      <p className="text-sm text-muted-foreground">
                        出版年: {post.book.published_year}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <RatingStars rating={post.rating} readonly size="lg" />
                  <p className="text-sm text-muted-foreground">
                    読了日: {post.read_at ? formatDateTime(post.read_at, "yyyy/MM/dd") : "未設定"}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="whitespace-pre-line leading-relaxed">{post.body}</div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="lg"
                  className={post.is_liked ? "text-red-500" : ""}
                  onClick={handleToggleLike}
                  disabled={isLiking}
                  aria-pressed={post.is_liked}
                >
                  <Heart className={`mr-2 h-5 w-5 ${post.is_liked ? "fill-current" : ""}`} />
                  {post.likes_count}
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link href="/contact">
                    <Flag className="mr-2 h-4 w-4" />
                    通報
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </RequireAuth>
  );
}
