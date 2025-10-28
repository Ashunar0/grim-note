import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { pushMock, resetNextNavigationMocks, setMockPathname } from "@/test/mocks/next-navigation";
import { resetAuthMocks } from "@/test/mocks/use-auth";
import PostDetailPage from "@/app/posts/[id]/page";
import { server } from "@/test/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

const buildPost = (overrides: Partial<import("@/types/posts").Post> = {}) => ({
  id: 42,
  body: "投稿本文のサンプルです。",
  rating: 5,
  read_at: "2024-01-10T00:00:00.000Z",
  created_at: "2024-01-15T12:00:00.000Z",
  likes_count: 8,
  is_liked: false,
  user: { id: 200, name: "Bob" },
  book: {
    id: 300,
    title: "銀河鉄道の夜",
    authors: "宮沢賢治",
    published_year: 1934,
  },
  tags: [
    { id: 1, name: "文学" },
    { id: 2, name: "ファンタジー" },
  ],
  ...overrides,
});

const renderWithSWR = async (ui: React.ReactElement) => {
  await act(async () => {
    render(<SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>);
  });
};

describe("PostDetailPage", () => {
  beforeEach(() => {
    setMockPathname("/posts/1");
  });

  afterEach(() => {
    resetNextNavigationMocks();
    resetAuthMocks();
  });

  it("投稿詳細を表示する (TEST-05-05)", async () => {
    const post = buildPost();

    server.use(
      http.get(`${API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ status: "success", data: post }, { status: 200 }),
      ),
    );

    await renderWithSWR(<PostDetailPage params={{ id: "42" }} />);

    expect(await screen.findByText("銀河鉄道の夜")).toBeInTheDocument();
    expect(screen.getByText("宮沢賢治")).toBeInTheDocument();
    expect(screen.getByText("投稿本文のサンプルです。")).toBeInTheDocument();
    expect(screen.getByText("文学")).toBeInTheDocument();
    expect(screen.getByText("ファンタジー")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("404 応答で未発見メッセージを表示する (TEST-05-06)", async () => {
    server.use(
      http.get(`${API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "NOT_FOUND", message: "Not found" },
          },
          { status: 404 },
        ),
      ),
    );

    await renderWithSWR(<PostDetailPage params={{ id: "999" }} />);

    expect(await screen.findByText("投稿が見つかりませんでした。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "タイムラインへ戻る" })).toBeInTheDocument();
  });

  it("500 系エラー時にエラーメッセージを表示する (TEST-05-08)", async () => {
    server.use(
      http.get(`${API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "INTERNAL_ERROR", message: "投稿取得でエラーが発生しました" },
          },
          { status: 500 },
        ),
      ),
    );

    await renderWithSWR(<PostDetailPage params={{ id: "42" }} />);

    expect(await screen.findByText("投稿取得でエラーが発生しました")).toBeInTheDocument();
  });

  it("いいねボタンをトグルできる", async () => {
    let liked = false;
    let likesCount = 5;

    server.use(
      http.get(`${API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json(
          {
            status: "success",
            data: buildPost({ id: 42, likes_count: likesCount, is_liked: liked }),
          },
          { status: 200 },
        ),
      ),
      http.post(`${API_BASE_URL}/posts/:id/like`, () => {
        liked = true;
        likesCount += 1;
        return HttpResponse.json(
          {
            status: "success",
            data: buildPost({ id: 42, likes_count: likesCount, is_liked: liked }),
          },
          { status: 201 },
        );
      }),
      http.delete(`${API_BASE_URL}/posts/:id/like`, () => {
        liked = false;
        likesCount -= 1;
        return HttpResponse.json(
          {
            status: "success",
            data: buildPost({ id: 42, likes_count: likesCount, is_liked: liked }),
          },
          { status: 200 },
        );
      }),
    );

    const user = userEvent.setup();
    await renderWithSWR(<PostDetailPage params={{ id: "42" }} />);

    const likeButton = await screen.findByRole("button", { name: "5" });
    await user.click(likeButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "6" })).toHaveClass("text-red-500");
    });

    await user.click(screen.getByRole("button", { name: "6" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "5" })).not.toHaveClass("text-red-500");
    });
  });

  it("いいね API が 401 を返した場合にログインへ誘導される", async () => {
    const post = buildPost({ likes_count: 2, is_liked: false });
    server.use(
      http.get(`${API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ status: "success", data: post }, { status: 200 }),
      ),
      http.post(`${API_BASE_URL}/posts/:id/like`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "UNAUTHORIZED", message: "ログインが必要です" },
          },
          { status: 401 },
        ),
      ),
    );

    const user = userEvent.setup();
    await renderWithSWR(<PostDetailPage params={{ id: "42" }} />);

    await user.click(await screen.findByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });
});
