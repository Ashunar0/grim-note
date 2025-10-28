import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import RatingStars from "./RatingStars";
import { formatDateTime } from "@/lib/date";

interface PostCardProps {
  id: string;
  bookTitle?: string;
  author?: string;
  content: string;
  rating: number;
  tags: string[];
  userName: string;
  userAvatar?: string;
  userId: string;
  likes: number;
  isLiked?: boolean;
  createdAt?: string;
}

export default function PostCard({
  id,
  bookTitle,
  author,
  content,
  rating,
  tags,
  userName,
  userAvatar,
  userId,
  likes,
  isLiked = false,
  createdAt,
}: PostCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/users/${userId}`} className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-medium hover:underline">{userName}</p>
              {createdAt && (
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(createdAt)}
                </p>
              )}
            </div>
          </Link>
        </div>
        {(bookTitle || author) && (
          <Link href={`/posts/${id}`}>
            <div className="space-y-1">
              {bookTitle && (
                <h3 className="text-lg font-semibold leading-tight hover:underline">
                  {bookTitle}
                </h3>
              )}
              {author && (
                <p className="text-sm text-muted-foreground">{author}</p>
              )}
            </div>
          </Link>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <RatingStars rating={rating} readonly />
        <Link href={`/posts/${id}`}>
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground/90">
            {content}
          </p>
        </Link>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className={isLiked ? "text-red-500" : ""}
        >
          <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          {likes}
        </Button>
      </CardFooter>
    </Card>
  );
}
