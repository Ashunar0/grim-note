import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, UserPlus, Settings } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  userId: string;
  userName: string;
  bio?: string;
  avatar?: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
}

export default function ProfileHeader({
  userId,
  userName,
  bio,
  avatar,
  isOwnProfile = false,
  isFollowing = false,
  followerCount = 0,
  followingCount = 0,
  postCount = 0,
}: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            <AvatarImage src={avatar} alt={userName} />
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <h1 className="text-2xl font-bold">{userName}</h1>
              {bio && (
                <p className="mt-2 text-sm text-muted-foreground">{bio}</p>
              )}
            </div>

            <div className="flex justify-center space-x-6 text-sm sm:justify-start">
              <div className="text-center">
                <div className="font-semibold">{postCount}</div>
                <div className="text-muted-foreground">投稿</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{followerCount}</div>
                <div className="text-muted-foreground">フォロワー</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{followingCount}</div>
                <div className="text-muted-foreground">フォロー中</div>
              </div>
            </div>

            {isOwnProfile ? (
              <Button variant="outline" asChild>
                <Link href={`/users/${userId}/edit`}>
                  <Settings className="mr-2 h-4 w-4" />
                  プロフィール編集
                </Link>
              </Button>
            ) : (
              <Button variant={isFollowing ? "outline" : "default"}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isFollowing ? "フォロー中" : "フォローする"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
