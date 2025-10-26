"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/RatingStars";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function NewPostPage() {
  const router = useRouter();
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(3);
  const [finishedDate, setFinishedDate] = useState<Date>();
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/timeline");
  };

  return (
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
              <p className="text-xs text-muted-foreground">
                <Button variant="link" className="h-auto p-0 text-xs" type="button" asChild>
                  <Link href="/books/search">書籍を検索する</Link>
                </Button>
              </p>
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
              <p className="text-xs text-muted-foreground text-right">
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
                      !finishedDate && "text-muted-foreground"
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

            <div className="flex space-x-3">
              <Button type="submit" className="flex-1">
                投稿する
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
