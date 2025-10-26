import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <CardTitle className="text-2xl">プライバシーポリシー</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-4">
          <section>
            <h2 className="text-lg font-semibold">1. 個人情報の収集</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当社は、本サービスの提供にあたり、以下の個人情報を収集します。
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              <li>メールアドレス</li>
              <li>ユーザー名</li>
              <li>プロフィール画像</li>
              <li>投稿内容</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. 個人情報の利用目的</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当社は、収集した個人情報を以下の目的で利用します。
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              <li>本サービスの提供、維持、保護および改善のため</li>
              <li>ユーザーからのお問い合わせに対応するため</li>
              <li>利用規約違反行為への対応のため</li>
              <li>本サービスに関する規約等の変更等を通知するため</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. 個人情報の第三者提供</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当社は、法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. 個人情報の開示</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより以下のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. お問い合わせ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本ポリシーに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <p className="text-sm text-muted-foreground">
            最終更新日: 2025年10月25日
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
