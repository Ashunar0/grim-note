import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Heart, Search } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              あなたの読書体験を、
              <br />
              誰かの気づきに。
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Grim Note は読書感想を共有し合うSNSです。
              <br />
              本を通じて、新しい出会いと発見を。
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/login">今すぐ始める</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">本を探す</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Grim Note でできること
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle>本の感想を投稿</CardTitle>
                <CardDescription>
                  読んだ本の感想や評価を投稿して、あなたの読書体験を記録できます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>読書家をフォロー</CardTitle>
                <CardDescription>
                  気になる読書家をフォローして、おすすめの本や感想をチェックできます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle>新しい本と出会う</CardTitle>
                <CardDescription>
                  タイムラインから新しい本を発見し、読書の幅を広げることができます。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                読書をもっと楽しく
              </h2>
              <p className="text-lg text-muted-foreground">
                本を読むだけでなく、感想を共有することで
                <br />
                新しい発見や気づきが生まれます。
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/register">無料で登録する</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
