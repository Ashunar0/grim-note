"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/RatingStars";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import RequireAuth from "@/components/RequireAuth";
import { apiClient } from "@/lib/api-client";
import type { ApiClientError, ApiSuccess } from "@/types/api";
import type { PostCreateResponse } from "@/types/posts";

type SelectedBookMeta = {
  googleBooksId: string | null;
  isbn13: string | null;
  publishedYear: number | null;
};

export default function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsSnapshot = useRef(searchParams.toString());

  const initialMeta = useMemo<SelectedBookMeta | null>(() => {
    const googleBooksId = searchParams.get("googleBooksId");
    const isbn13 = searchParams.get("isbn13");
    const publishedYearParam = searchParams.get("publishedYear");
    const publishedYear =
      publishedYearParam && !Number.isNaN(Number(publishedYearParam))
        ? Number(publishedYearParam)
        : null;

    if (googleBooksId || isbn13 || publishedYear) {
      return {
        googleBooksId: googleBooksId ?? null,
        isbn13: isbn13 ?? null,
        publishedYear,
      };
    }
    return null;
  }, [searchParams]);

  const [bookTitle, setBookTitle] = useState(searchParams.get("title") ?? "");
  const [author, setAuthor] = useState(searchParams.get("authors") ?? "");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(3);
  const [finishedDate, setFinishedDate] = useState<Date>();
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBookMeta, setSelectedBookMeta] = useState<SelectedBookMeta | null>(
    initialMeta,
  );

  useEffect(() => {
    const current = searchParams.toString();
    if (current === searchParamsSnapshot.current) {
      return;
    }
    searchParamsSnapshot.current = current;

    const title = searchParams.get("title");
    const authorsParam = searchParams.get("authors");
    if (title) {
      setBookTitle(title);
    }
    if (authorsParam !== null) {
      setAuthor(authorsParam);
    }

    const googleBooksId = searchParams.get("googleBooksId");
    const isbn13 = searchParams.get("isbn13");
    const publishedYearParam = searchParams.get("publishedYear");
    const publishedYear =
      publishedYearParam && !Number.isNaN(Number(publishedYearParam))
        ? Number(publishedYearParam)
        : null;

    if (googleBooksId || isbn13 || publishedYear) {
      setSelectedBookMeta({
        googleBooksId: googleBooksId ?? null,
        isbn13: isbn13 ?? null,
        publishedYear,
      });
    }
  }, [searchParams]);

  const clearSelectedBook = () => {
    setSelectedBookMeta(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const finishedAt = finishedDate
      ? format(finishedDate, "yyyy-MM-dd")
      : null;

    const payload: Record<string, unknown> = {
      body: content,
      rating,
      read_at: finishedAt,
      tags: tagList,
    };

    const bookPayload: Record<string, unknown> = {};
    if (bookTitle) {
      bookPayload.title = bookTitle;
    }
    if (author) {
      bookPayload.authors = author;
    }
    if (selectedBookMeta?.googleBooksId) {
      bookPayload.google_books_id = selectedBookMeta.googleBooksId;
    }
    if (selectedBookMeta?.isbn13) {
      bookPayload.isbn13 = selectedBookMeta.isbn13;
    }
    if (selectedBookMeta?.publishedYear) {
      bookPayload.published_year = selectedBookMeta.publishedYear;
    }

    if (Object.keys(bookPayload).length > 0) {
      payload.book = bookPayload;
    }

    try {
      await apiClient.post<ApiSuccess<PostCreateResponse>>("/posts", payload);
      router.push("/timeline");
    } catch (err) {
      const apiError = err as ApiClientError;
      const message =
        apiError.data?.error?.details?.[0] ??
        apiError.data?.error?.message ??
        "投稿に失敗しました";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>新しい投稿を作成</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bookTitle">書籍タイトル *</Label>
                <Input
                  id="bookTitle"
                  placeholder="例: 人間失格"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  required
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs"
                    type="button"
                    asChild
                  >
                    <Link href="/books/search">書籍を検索する</Link>
                  </Button>
                  {selectedBookMeta && (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      type="button"
                      onClick={clearSelectedBook}
                    >
                      選択した書籍情報をクリア
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">著者名 *</Label>
                <Input
                  id="author"
                  placeholder="例: 太宰治"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>評価 *</Label>
                <RatingStars rating={rating} onChange={setRating} size="lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">感想 *</Label>
                <Textarea
                  id="content"
                  placeholder="この本を読んだ感想を書いてください（最大500文字）"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  maxLength={500}
                  required
                />
                <p className="text-right text-xs text-muted-foreground">
                  {content.length} / 500
                </p>
              </div>

              <div className="space-y-2">
                <Label>読了日</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !finishedDate && "text-muted-foreground",
                      )}
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {finishedDate ? (
                        format(finishedDate, "PPP", { locale: ja })
                      ) : (
                        <span>日付を選択</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={finishedDate}
                      onSelect={setFinishedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">タグ</Label>
                <Input
                  id="tags"
                  placeholder="例: 日本文学, 純文学, 太宰治"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  カンマ（,）で区切って複数のタグを入力できます
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "送信中..." : "投稿する"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
