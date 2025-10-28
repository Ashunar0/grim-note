"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { apiClient } from "@/lib/api-client";
import type { ApiClientError, ApiSuccess } from "@/types/api";
import type { Profile } from "@/types/profile";
import { useAuth } from "@/hooks/use-auth";

const MAX_BIO_LENGTH = 160;

type EditProfilePageProps = {
  params: { id: string };
};

export default function EditProfilePage({ params }: EditProfilePageProps) {
  const router = useRouter();
  const { refresh } = useAuth();
  const userId = Number(params.id);
  const numericOrStringId = Number.isNaN(userId) ? params.id : userId;
  const { profile, isLoading, error, mutate } = useProfile(numericOrStringId);

  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && error?.status === 401) {
      router.replace("/login");
    }
  }, [error, isLoading, router]);

  useEffect(() => {
    if (!isLoading && profile && !profile.is_self) {
      router.replace(`/users/${profile.id}`);
    }
  }, [profile, isLoading, router]);

  useEffect(() => {
    if (profile && profile.is_self && !initializedRef.current) {
      setUserName(profile.name);
      setBio(profile.bio ?? "");
      setAvatar(profile.icon_url ?? "");
      initializedRef.current = true;
    }
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClient.patch<ApiSuccess<Profile>>("/profile", {
        name: userName.trim(),
        bio: bio.trim(),
        icon_url: avatar.trim(),
      });
      await mutate();
      await refresh();
      router.push(`/users/${profile.id}`);
      router.refresh();
    } catch (err) {
      const apiError = err as ApiClientError;
      const message =
        apiError.data?.error?.message ?? "プロフィールの更新に失敗しました";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="py-12 text-center text-muted-foreground">
          読み込み中です...
        </div>
      </div>
    );
  }

  if (error && error.status !== 401) {
    const message =
      error.data?.error?.message ?? "プロフィールの取得に失敗しました";
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="py-12 text-center text-destructive">{message}</div>
      </div>
    );
  }

  if (!profile || !profile.is_self) {
    return null;
  }

  if (!initializedRef.current) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="py-12 text-center text-muted-foreground">
          読み込み中です...
        </div>
      </div>
    );
  }

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
                maxLength={50}
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
                maxLength={MAX_BIO_LENGTH}
              />
              <p className="text-right text-xs text-muted-foreground">
                {bio.length} / {MAX_BIO_LENGTH}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">アイコン URL</Label>
              <Input
                id="avatarUrl"
                placeholder="https://example.com/avatar.png"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <div className="flex space-x-3">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/users/${profile.id}`)}
                disabled={isSubmitting}
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
