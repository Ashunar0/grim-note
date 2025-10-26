import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, User, Flag, BookOpen } from "lucide-react";
import Link from "next/link";
import RatingStars from "@/components/RatingStars";

const DUMMY_POST = {
  id: "1",
  bookTitle: "人間失格",
  author: "太宰治",
  publishedYear: "1948",
  content:
    "太宰治の代表作である「人間失格」を読みました。主人公の葉蔵の人生を通して、人間の本質や社会との関わり方について深く考えさせられました。\n\n葉蔵が抱える孤独感や疎外感は、現代社会にも通じるものがあり、非常に共感できる部分が多かったです。特に「恥の多い生涯を送って来ました」という冒頭の一文は、読者の心に深く刺さります。\n\n読み終えた後も、この作品が持つ重みが心に残り続けています。人間とは何か、生きるとは何かを考えさせられる名作です。",
  rating: 4.5,
  tags: ["日本文学", "純文学", "太宰治"],
  finishedDate: "2025年10月15日",
  userName: "読書太郎",
  userId: "2",
  userAvatar: "",
  likes: 12,
  isLiked: false,
  createdAt: "2025年10月20日",
};

export default function PostDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Card>
        <CardHeader className="space-y-4">
          <Link
            href={`/users/${DUMMY_POST.userId}`}
            className="flex items-center space-x-3"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={DUMMY_POST.userAvatar} alt={DUMMY_POST.userName} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium hover:underline">{DUMMY_POST.userName}</p>
              <p className="text-xs text-muted-foreground">
                {DUMMY_POST.createdAt}
              </p>
            </div>
          </Link>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex h-20 w-14 items-center justify-center rounded bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <h1 className="text-2xl font-bold">{DUMMY_POST.bookTitle}</h1>
                <p className="text-muted-foreground">{DUMMY_POST.author}</p>
                <p className="text-sm text-muted-foreground">
                  出版年: {DUMMY_POST.publishedYear}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <RatingStars rating={DUMMY_POST.rating} readonly size="lg" />
              <p className="text-sm text-muted-foreground">
                読了日: {DUMMY_POST.finishedDate}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="whitespace-pre-line leading-relaxed">
            {DUMMY_POST.content}
          </div>

          {DUMMY_POST.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {DUMMY_POST.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="lg"
              className={DUMMY_POST.isLiked ? "text-red-500" : ""}
            >
              <Heart
                className={`mr-2 h-5 w-5 ${
                  DUMMY_POST.isLiked ? "fill-current" : ""
                }`}
              />
              {DUMMY_POST.likes}
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
    </div>
  );
}
