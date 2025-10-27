import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, beforeEach } from "vitest";
import {
  resetNextNavigationMocks,
  setMockPathname,
  setMockSearchParams,
} from "@/test/mocks/next-navigation";
import { resetAuthMocks } from "@/test/mocks/use-auth";
import BookSearchPage from "@/app/books/search/page";
import { server } from "@/test/server";

const API_BASE = "http://localhost:3000/api/v1";

describe("BookSearchPage", () => {
  beforeEach(() => {
    setMockPathname("/books/search");
    setMockSearchParams({});
  });

  afterEach(() => {
    resetNextNavigationMocks();
    resetAuthMocks();
  });

  it("検索結果を表示する", async () => {
    server.use(
      http.get(`${API_BASE}/books/search`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("q")).toBe("吾輩は猫");
        return HttpResponse.json(
          {
            status: "success",
            data: [
              {
                google_books_id: "gb-123",
                title: "吾輩は猫である",
                authors: "夏目漱石",
                isbn13: "9781234567890",
                published_year: 1905,
              },
            ],
          },
          { status: 200 },
        );
      }),
    );

    render(<BookSearchPage />);
    const user = userEvent.setup();

    await act(async () => {
      await user.type(
        screen.getByPlaceholderText("書籍タイトルまたはISBNで検索"),
        "吾輩は猫",
      );
      await user.click(screen.getByRole("button", { name: "検索" }));
    });

    expect(
      await screen.findByText("吾輩は猫である"),
    ).toBeInTheDocument();
    expect(screen.getByText("夏目漱石")).toBeInTheDocument();
  });

  it("API エラー時にエラーメッセージを表示する", async () => {
    server.use(
      http.get(`${API_BASE}/books/search`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "SERVER_ERROR", message: "外部サービスエラー" },
          },
          { status: 500 },
        ),
      ),
    );

    render(<BookSearchPage />);
    const user = userEvent.setup();

    await act(async () => {
      await user.type(
        screen.getByPlaceholderText("書籍タイトルまたはISBNで検索"),
        "壊れる検索",
      );
      await user.click(screen.getByRole("button", { name: "検索" }));
    });

    expect(
      await screen.findByText("外部サービスエラー"),
    ).toBeInTheDocument();
  });

  it("空入力時にバリデーションメッセージを表示する", async () => {
    render(<BookSearchPage />);
    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "検索" }));
    });

    expect(
      await screen.findByText("検索キーワードを入力してください"),
    ).toBeInTheDocument();
  });
});
