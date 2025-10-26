import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          <CardTitle className="text-2xl">利用規約</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-4">
          <section>
            <h2 className="text-lg font-semibold">第1条（適用）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本規約は、本サービスの提供条件及び本サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第2条（定義）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本規約において使用する用語の定義は、次に掲げるとおりとします。
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              <li>「本サービス」とは、当社が提供する「Grim Note」という名称のサービスを意味します。</li>
              <li>「ユーザー」とは、本サービスを利用する全ての方を意味します。</li>
              <li>「投稿データ」とは、ユーザーが本サービスを利用して投稿その他送信するコンテンツを意味します。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第3条（禁止事項）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>他のユーザー、第三者または当社の権利を侵害する行為</li>
              <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第4条（免責事項）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
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
