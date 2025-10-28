export type BookSearchResult = {
  google_books_id: string | null;
  title: string;
  authors: string | null;
  isbn13: string | null;
  published_year: number | null;
};
