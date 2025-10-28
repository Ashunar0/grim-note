import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, beforeEach } from "vitest";
import {
  pushMock,
  resetNextNavigationMocks,
  setMockPathname,
  setMockSearchParams,
} from "@/test/mocks/next-navigation";
import { resetAuthMocks } from "@/test/mocks/use-auth";
import NewPostPage from "@/app/posts/new/page";
import { server } from "@/test/server";

const API_BASE = "http://localhost:3000/api/v1";

describe("NewPostPage", () => {
  beforeEach(() => {
    setMockPathname("/posts/new");
    setMockSearchParams({});
  });

  afterEach(() => {
    resetNextNavigationMocks();
    resetAuthMocks();
  });

  it("検索で選択した書籍情報を反映し、投稿に成功するとタイムラインへリダイレクトする", async () => {
    setMockSearchParams({
      title: "銀河鉄道の夜",
      authors: "宮沢賢治",
      googleBooksId: "gb-999",
      isbn13: "9784101092058",
      publishedYear: "1934",
    });

    server.use(
      http.post(`${API_BASE}/posts`, async ({ request }) => {
        const body = (await request.json()) as Record<string, any>;
        expect(body.book.title).toBe("銀河鉄道の夜");
        expect(body.book.google_books_id).toBe("gb-999");
        expect(body.book.isbn13).toBe("9784101092058");
        expect(body.tags).toEqual(["ファンタジー"]);

        return HttpResponse.json(
          {
            status: "success",
            data: {
              id: 101,
              book_id: 55,
              body: "素晴らしい作品でした",
              rating: 3,
              read_at: null,
              tags: ["ファンタジー"],
            },
          },
          { status: 201 },
        );
      }),
    );

    await act(async () => {
      render(<NewPostPage />);
    });

    const user = userEvent.setup();

    expect(
      screen.getByDisplayValue("銀河鉄道の夜"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("宮沢賢治")).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("感想 *"),
      "素晴らしい作品でした",
    );
    await user.type(screen.getByLabelText("タグ"), "ファンタジー");

    await user.click(screen.getByRole("button", { name: "投稿する" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/timeline");
    });
  });

  it("バリデーションエラー時にエラーメッセージを表示しボタンを再度有効化する", async () => {
    server.use(
      http.post(`${API_BASE}/posts`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: {
              code: "VALIDATION_ERROR",
              message: "本文は必須です",
              details: ["本文は必須です"],
            },
          },
          { status: 422 },
        ),
      ),
    );

    await act(async () => {
      render(<NewPostPage />);
    });

    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText("書籍タイトル *"),
      "走れメロス",
    );
    await user.type(screen.getByLabelText("著者名 *"), "太宰治");
    await user.type(screen.getByLabelText("感想 *"), "短編です");

    const submitButton = screen.getByRole("button", { name: "投稿する" });
    await user.click(submitButton);

    expect(
      await screen.findByText("本文は必須です"),
    ).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });
});
