import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { pushMock, resetNextNavigationMocks, setMockPathname } from "@/test/mocks/next-navigation";
import { resetAuthMocks } from "@/test/mocks/use-auth";
import TimelinePage from "@/app/timeline/page";
import { server } from "@/test/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

const buildPost = (overrides: Partial<import("@/types/posts").Post> = {}) => ({
  id: 1,
  body: "本の感想です",
  rating: 4,
  read_at: "2024-01-01T00:00:00.000Z",
  created_at: "2024-01-02T12:00:00.000Z",
  likes_count: 10,
  is_liked: false,
  user: { id: 99, name: "Alice" },
  book: { id: 77, title: "テスト書籍", authors: "著者A", published_year: 2020 },
  tags: [
    { id: 1, name: "文学" },
    { id: 2, name: "SF" },
  ],
  ...overrides,
});

const renderWithSWR = async (ui: React.ReactElement) => {
  await act(async () => {
    render(<SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>);
  });
};

describe("TimelinePage", () => {
  beforeEach(() => {
    setMockPathname("/timeline");
  });

  afterEach(() => {
    resetNextNavigationMocks();
    resetAuthMocks();
  });

  it("API レスポンスの投稿を表示する (TEST-05-01)", async () => {
    const post = buildPost();

    server.use(
      http.get(`${API_BASE_URL}/posts`, () =>
        HttpResponse.json({ status: "success", data: [post] }, { status: 200 }),
      ),
    );

    await renderWithSWR(<TimelinePage />);

    expect(await screen.findByText("テスト書籍")).toBeInTheDocument();
    expect(screen.getByText("著者A")).toBeInTheDocument();
    expect(screen.getByText("文学")).toBeInTheDocument();
    expect(screen.getByText("SF")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("空配列の場合に空状態を表示する (TEST-05-02)", async () => {
    server.use(
      http.get(`${API_BASE_URL}/posts`, () =>
        HttpResponse.json({ status: "success", data: [] }, { status: 200 }),
      ),
    );

    await renderWithSWR(<TimelinePage />);

    expect(await screen.findByText("投稿がまだありません")).toBeInTheDocument();
    expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
  });

  it("フォロー中タブ選択時に tab=following を付けてリクエストする (TEST-05-03)", async () => {
    const requests: string[] = [];

    server.use(
      http.get(`${API_BASE_URL}/posts`, ({ request }) => {
        requests.push(request.url);
        const url = new URL(request.url);
        const tab = url.searchParams.get("tab");

        if (tab === "following") {
          return HttpResponse.json(
            {
              status: "success",
              data: [
                buildPost({
                  id: 2,
                  book: { id: 88, title: "Following Book", authors: "Follower", published_year: 2019 },
                }),
              ],
            },
            { status: 200 },
          );
        }

        return HttpResponse.json(
          {
            status: "success",
            data: [
              buildPost({
                id: 1,
                book: { id: 77, title: "Recent Book", authors: "Recent Author", published_year: 2020 },
              }),
            ],
          },
          { status: 200 },
        );
      }),
    );

    const user = userEvent.setup();
    await renderWithSWR(<TimelinePage />);

    await waitFor(() => expect(requests.length).toBeGreaterThan(0));

    expect(await screen.findByText("Recent Book")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "フォロー中" }));

    await waitFor(() => {
      expect(screen.getByText("Following Book")).toBeInTheDocument();
    });

    expect(requests.some((url) => url.includes("tab=following"))).toBe(true);
  });

  it("PostCard に likes_count とタグが反映される (TEST-05-04)", async () => {
    const post = buildPost({ likes_count: 42 });
    let called = false;

    server.use(
      http.get(`${API_BASE_URL}/posts`, () => {
        called = true;
        return HttpResponse.json({ status: "success", data: [post] }, { status: 200 });
      }),
    );

    await renderWithSWR(<TimelinePage />);

    expect(await screen.findByText("テスト書籍")).toBeInTheDocument();
    expect(called).toBe(true);
    expect(screen.getByRole("button", { name: /42/ })).toBeInTheDocument();
    expect(screen.getByText("文学")).toBeInTheDocument();
    expect(screen.getByText("SF")).toBeInTheDocument();
  });

  it("API エラー時にエラーメッセージを表示する (TEST-05-07)", async () => {
    server.use(
      http.get(`${API_BASE_URL}/posts`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "INTERNAL_ERROR", message: "サーバーエラー" },
          },
          { status: 500 },
        ),
      ),
    );

    await renderWithSWR(<TimelinePage />);

    expect(await screen.findByText("サーバーエラー")).toBeInTheDocument();
  });

  it("いいねボタンで likes が更新される", async () => {
    let liked = false;
    let likesCount = 3;

    server.use(
      http.get(`${API_BASE_URL}/posts`, () =>
        HttpResponse.json(
          {
            status: "success",
            data: [
              buildPost({ id: 1, likes_count: likesCount, is_liked: liked, body: "いいねテスト" }),
            ],
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
            data: buildPost({ id: 1, likes_count: likesCount, is_liked: liked }),
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
            data: buildPost({ id: 1, likes_count: likesCount, is_liked: liked }),
          },
          { status: 200 },
        );
      }),
    );

    const user = userEvent.setup();
    await renderWithSWR(<TimelinePage />);

    const likeButton = await screen.findByRole("button", { name: "3" });
    await user.click(likeButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "4" })).toHaveClass("text-red-500");
    });

    await user.click(screen.getByRole("button", { name: "4" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "3" })).not.toHaveClass("text-red-500");
    });
  });

  it("いいね API が 401 を返した場合にログインへ誘導する", async () => {
    const post = buildPost({ likes_count: 2, is_liked: false });
    server.use(
      http.get(`${API_BASE_URL}/posts`, () =>
        HttpResponse.json({ status: "success", data: [post] }, { status: 200 }),
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
    await renderWithSWR(<TimelinePage />);

    await user.click(await screen.findByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });
});
