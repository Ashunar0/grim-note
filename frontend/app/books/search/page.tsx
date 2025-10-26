"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import BookCard from "@/components/BookCard";

const DUMMY_BOOKS = [
  {
    title: "ノルウェイの森",
    author: "村上春樹",
    publishedYear: "1987",
    thumbnail: "",
    isbn: "9784062748704",
  },
  {
    title: "こころ",
    author: "夏目漱石",
    publishedYear: "1914",
    thumbnail: "",
    isbn: "9784101010137",
  },
  {
    title: "銀河鉄道の夜",
    author: "宮沢賢治",
    publishedYear: "1934",
    thumbnail: "",
    isbn: "9784101092058",
  },
];

export default function BookSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(DUMMY_BOOKS);

  const handleSearch = () => {
    setSearchResults(DUMMY_BOOKS);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">書籍検索</h1>

      <div className="mb-6 flex space-x-2">
        <Input
          placeholder="書籍タイトルまたはISBNで検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          検索
        </Button>
      </div>

      <div className="space-y-4">
        {searchResults.length > 0 ? (
          searchResults.map((book, index) => (
            <BookCard key={index} {...book} />
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            検索結果がありません
          </div>
        )}
      </div>
    </div>
  );
}
