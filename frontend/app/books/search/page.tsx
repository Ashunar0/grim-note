"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import BookCard from "@/components/BookCard";
import { apiClient } from "@/lib/api-client";
import type { ApiClientError, ApiSuccess } from "@/types/api";
import type { BookSearchResult } from "@/types/books";

export default function BookSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const keyword = searchQuery.trim();
    if (!keyword) {
      setError("検索キーワードを入力してください");
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<ApiSuccess<BookSearchResult[]>>(
        "/books/search",
        { params: { q: keyword } },
      );
      setSearchResults(response.data ?? []);
      setHasSearched(true);
    } catch (err) {
      const apiError = err as ApiClientError;
      const message =
        apiError.data?.error?.message ?? "書籍検索に失敗しました";
      setError(message);
      setSearchResults([]);
      setHasSearched(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">書籍検索</h1>

      <div className="mb-6 flex flex-col space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="書籍タイトルまたはISBNで検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} type="button" disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "検索中..." : "検索"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">
          読み込み中です...
        </div>
      ) : (
        <div className="space-y-4">
          {searchResults.length > 0 ? (
            searchResults.map((book) => (
              <BookCard
                key={`${book.google_books_id ?? book.isbn13 ?? book.title}`}
                title={book.title}
                authors={book.authors}
                publishedYear={book.published_year}
                googleBooksId={book.google_books_id}
                isbn13={book.isbn13}
              />
            ))
          ) : hasSearched ? (
            <div className="py-12 text-center text-muted-foreground">
              検索結果がありません
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              書籍タイトルまたは ISBN を入力して検索してください
            </div>
          )}
        </div>
      )}
    </div>
  );
}
