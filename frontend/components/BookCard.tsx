import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";

interface BookCardProps {
  title: string;
  author: string;
  publishedYear?: string;
  thumbnail?: string;
  isbn?: string;
}

export default function BookCard({
  title,
  author,
  publishedYear,
  thumbnail,
  isbn,
}: BookCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex space-x-4">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-24 w-16 rounded object-cover"
            />
          ) : (
            <div className="flex h-24 w-16 items-center justify-center rounded bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">{author}</p>
            {publishedYear && (
              <p className="text-xs text-muted-foreground">{publishedYear}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href="/posts/new">この本で投稿する</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
