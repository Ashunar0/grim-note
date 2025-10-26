"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [userName, setUserName] = useState("読書太郎");
  const [bio, setBio] = useState(
    "本が好きで毎日読書をしています。特に日本文学と海外ミステリーが好きです。"
  );
  const [avatar, setAvatar] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/users/${params.id}`);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール編集</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatar} alt={userName} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" type="button">
                <Upload className="mr-2 h-4 w-4" />
                画像を変更
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">ユーザー名 *</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                placeholder="あなたについて教えてください"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length} / 200
              </p>
            </div>

            <div className="flex space-x-3">
              <Button type="submit" className="flex-1">
                保存
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
