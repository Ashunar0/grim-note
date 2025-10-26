"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const DUMMY_POSTS = [
  {
    id: "1",
    bookTitle: "人間失格",
    author: "太宰治",
    content:
      "太宰治の代表作。主人公の葉蔵の人生を通して、人間の本質や社会との関わり方について深く考えさせられました。読み終えた後も、この作品が持つ重みが心に残り続けています。",
    rating: 4.5,
    tags: ["日本文学", "純文学", "太宰治"],
    userName: "読書太郎",
    userId: "2",
    likes: 12,
    isLiked: false,
  },
  {
    id: "2",
    bookTitle: "1984年",
    author: "ジョージ・オーウェル",
    content:
      "ディストピア小説の金字塔。全体主義社会の恐ろしさと、個人の自由の大切さを痛感しました。現代社会にも通じるテーマが多く、読み応えのある一冊でした。",
    rating: 5.0,
    tags: ["海外文学", "ディストピア", "SF"],
    userName: "本好き花子",
    userId: "3",
    likes: 24,
    isLiked: true,
  },
  {
    id: "3",
    bookTitle: "君の名は。",
    author: "新海誠",
    content:
      "映画も素晴らしかったですが、小説版も読みました。二人の心情描写がより丁寧で、映画では気づかなかった細かい伏線にも気づけました。",
    rating: 4.0,
    tags: ["ライトノベル", "アニメ", "恋愛"],
    userName: "アニメ次郎",
    userId: "4",
    likes: 8,
    isLiked: false,
  },
];

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState("recent");

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">新着</TabsTrigger>
          <TabsTrigger value="following">フォロー中</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6 space-y-4">
          {DUMMY_POSTS.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </TabsContent>

        <TabsContent value="following" className="mt-6 space-y-4">
          <div className="py-12 text-center text-muted-foreground">
            フォロー中のユーザーの投稿はまだありません
          </div>
        </TabsContent>
      </Tabs>

      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        asChild
      >
        <Link href="/posts/new">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
