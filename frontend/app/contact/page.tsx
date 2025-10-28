"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import type { ApiClientError } from "@/types/api";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const initialPostId = useMemo(() => searchParams?.get("postId") ?? "", [searchParams]);

  const [postId, setPostId] = useState(initialPostId);
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setPostId(initialPostId);
  }, [initialPostId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!category) {
      setErrorMessage("お問い合わせ種別を選択してください");
      return;
    }

    const rawPostId = postId.trim();
    const sanitizedPostId = rawPostId.replace(/[^0-9]/g, "");
    const parsedPostId =
      sanitizedPostId.length > 0 ? Number.parseInt(sanitizedPostId, 10) : undefined;

    if (rawPostId !== "" && (parsedPostId === undefined || Number.isNaN(parsedPostId))) {
      setErrorMessage("投稿IDは数字で入力してください");
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);
    setErrorMessage(null);

    try {
      await apiClient.post("/reports", {
        post_id: parsedPostId,
        category,
        message,
        email: email || undefined,
      });
      setSuccess(true);
      setMessage("");
    } catch (err) {
      const apiError = err as ApiClientError;
      const fallback =
        "送信に失敗しました。時間を置いて再度お試しください。";
      setErrorMessage(apiError?.data?.error?.message ?? fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldMutation = () => {
    if (success) {
      setSuccess(false);
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>お問い合わせ</CardTitle>
          <CardDescription>
            ご質問やご意見、不適切な投稿の通報など、お気軽にお問い合わせください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <Alert>
                <AlertTitle>送信が完了しました</AlertTitle>
                <AlertDescription>
                  ご連絡ありがとうございます。内容を確認いたします。
                </AlertDescription>
              </Alert>
            )}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>送信に失敗しました</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="postId">対象の投稿 ID</Label>
              <Input
                id="postId"
                type="number"
                min="1"
                placeholder="例: 123"
                value={postId}
                onChange={(event) => {
                  setPostId(event.target.value);
                  handleFieldMutation();
                }}
              />
              <p className="text-xs text-muted-foreground">
                通報ボタンから遷移すると自動入力されます。該当する投稿がない場合は空のままで構いません。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">お問い合わせ種別 *</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value);
                  handleFieldMutation();
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">質問</SelectItem>
                  <SelectItem value="bug">バグ報告</SelectItem>
                  <SelectItem value="report">不適切な投稿の通報</SelectItem>
                  <SelectItem value="feedback">ご意見・ご要望</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  handleFieldMutation();
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">お問い合わせ内容 *</Label>
              <Textarea
                id="message"
                placeholder="お問い合わせ内容を詳しくお書きください"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  handleFieldMutation();
                }}
                rows={8}
                maxLength={1000}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "送信する"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
