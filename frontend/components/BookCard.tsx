import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BookCardProps {
  title: string;
  authors: string | null;
  publishedYear?: number | null;
  thumbnail?: string | null;
  isbn13?: string | null;
  googleBooksId?: string | null;
}

export default function BookCard({
  title,
  authors,
  publishedYear,
  thumbnail,
  isbn13,
  googleBooksId,
}: BookCardProps) {
  const query: Record<string, string> = { title };
  if (authors) {
    query.authors = authors;
  }
  if (publishedYear) {
    query.publishedYear = String(publishedYear);
  }
  if (isbn13) {
    query.isbn13 = isbn13;
  }
  if (googleBooksId) {
    query.googleBooksId = googleBooksId;
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex space-x-4">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              className="h-24 w-16 rounded object-cover"
              width={64}
              height={96}
            />
          ) : (
            <div className="flex h-24 w-16 items-center justify-center rounded bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {authors ?? "著者情報なし"}
            </p>
            {publishedYear && (
              <p className="text-xs text-muted-foreground">{publishedYear}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href={{ pathname: "/posts/new", query }}>
            この本で投稿する
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
