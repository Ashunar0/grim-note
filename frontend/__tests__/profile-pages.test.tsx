import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, beforeEach } from "vitest";
import {
  pushMock,
  replaceMock,
  resetNextNavigationMocks,
  setMockPathname,
} from "@/test/mocks/next-navigation";
import {
  resetAuthMocks,
  setAuthMockState,
  refreshAuthMock,
} from "@/test/mocks/use-auth";
import { server } from "@/test/server";
import UserProfilePage from "@/app/users/[id]/page";
import EditProfilePage from "@/app/users/[id]/edit/page";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

const renderWithSWR = async (ui: React.ReactElement) => {
  await act(async () => {
    render(<SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>);
  });
};

const buildProfile = (
  overrides: Partial<import("@/types/profile").Profile> = {},
) => ({
  id: 1,
  name: "Alice Reader",
  bio: "本が好きです",
  icon_url: "https://example.com/alice.png",
  follower_count: 2,
  following_count: 3,
  post_count: 1,
  is_self: true,
  is_following: false,
  posts: [
    {
      id: 11,
      body: "素晴らしい本でした",
      rating: 4,
      read_at: "2024-01-01",
      created_at: "2024-01-05T12:00:00.000Z",
      likes_count: 5,
      is_liked: false,
      book: {
        id: 100,
        title: "吾輩は猫である",
        authors: "夏目漱石",
        published_year: 1905,
      },
      tags: [
        { id: 1, name: "日本文学" },
        { id: 2, name: "クラシック" },
      ],
    },
  ],
  ...overrides,
});

describe("UserProfilePage", () => {
  afterEach(() => {
    resetNextNavigationMocks();
    resetAuthMocks();
  });

  it("API レスポンスを表示する (TEST-10-01)", async () => {
    const profile = buildProfile();
    server.use(
      http.get(`${API_BASE_URL}/users/1`, () =>
        HttpResponse.json({ status: "success", data: profile }, { status: 200 }),
      ),
    );

    await renderWithSWR(<UserProfilePage params={{ id: "1" }} />);

    expect(
      await screen.findByRole("heading", { name: "Alice Reader" }),
    ).toBeInTheDocument();
    expect(screen.getByText("吾輩は猫である")).toBeInTheDocument();
    expect(screen.getByText("夏目漱石")).toBeInTheDocument();
    expect(screen.getByText("日本文学")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /プロフィール編集/ })).toBeInTheDocument();
  });

  it("投稿がない場合に空状態を表示する (TEST-10-02)", async () => {
    const profile = buildProfile({ posts: [], post_count: 0 });
    server.use(
      http.get(`${API_BASE_URL}/users/1`, () =>
        HttpResponse.json({ status: "success", data: profile }, { status: 200 }),
      ),
    );

    await renderWithSWR(<UserProfilePage params={{ id: "1" }} />);

    expect(await screen.findByText("まだ投稿がありません")).toBeInTheDocument();
  });

  it("本人でない場合はフォローボタンを表示する (TEST-10-03)", async () => {
    const profile = buildProfile({
      is_self: false,
      is_following: true,
    });
    server.use(
      http.get(`${API_BASE_URL}/users/2`, () =>
        HttpResponse.json({ status: "success", data: { ...profile, id: 2 } }, { status: 200 }),
      ),
    );

    await renderWithSWR(<UserProfilePage params={{ id: "2" }} />);

    expect(
      await screen.findByRole("button", { name: /フォロー中/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /プロフィール編集/ })).not.toBeInTheDocument();
  });

  it("未ログイン時はログイン導線を表示する (TEST-10-04)", async () => {
    setAuthMockState({ user: null });
    server.use(
      http.get(`${API_BASE_URL}/users/1`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "UNAUTHORIZED", message: "ログインが必要です" },
          },
          { status: 401 },
        ),
      ),
    );

    await renderWithSWR(<UserProfilePage params={{ id: "1" }} />);

    expect(await screen.findByText("プロフィールを表示するにはログインが必要です。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログインページへ移動" })).toBeInTheDocument();
  });

  it("書籍情報が無い投稿はタイトル/著者を非表示にする", async () => {
    const profile = buildProfile({
      posts: [
        {
          id: 11,
          body: "素晴らしい本でした",
          rating: 4,
          read_at: "2024-01-01",
          created_at: "2024-01-05T12:00:00.000Z",
          likes_count: 5,
          is_liked: false,
          book: null,
          tags: [],
        },
      ],
      post_count: 1,
    });
    server.use(
      http.get(`${API_BASE_URL}/users/3`, () =>
        HttpResponse.json(
          { status: "success", data: { ...profile, id: 3 } },
          { status: 200 },
        ),
      ),
    );

    await renderWithSWR(<UserProfilePage params={{ id: "3" }} />);

    expect(
      await screen.findByText("素晴らしい本でした"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "吾輩は猫である" }),
    ).not.toBeInTheDocument();
  });
});
describe("EditProfilePage", () => {
  beforeEach(() => {
    setMockPathname("/users/1/edit");
  });

  afterEach(() => {
    resetNextNavigationMocks();
    resetAuthMocks();
  });

  it("プロフィールを更新し詳細ページへ戻る (TEST-10-05)", async () => {
    let profile = buildProfile();

    server.use(
      http.get(`${API_BASE_URL}/users/1`, () =>
        HttpResponse.json({ status: "success", data: profile }, { status: 200 }),
      ),
      http.patch(`${API_BASE_URL}/profile`, async ({ request }) => {
        const body = (await request.json()) as Record<string, string>;
        profile = buildProfile({
          name: body.name,
          bio: body.bio,
          icon_url: body.icon_url,
        });
        return HttpResponse.json({ status: "success", data: profile }, { status: 200 });
      }),
    );

    await renderWithSWR(<EditProfilePage params={{ id: "1" }} />);

    const nameInput = await screen.findByDisplayValue("Alice Reader");
    const bioTextarea = screen.getByDisplayValue("本が好きです");

    const user = userEvent.setup();
    await user.clear(nameInput);
    await user.type(nameInput, "Alice Updated");
    await user.clear(bioTextarea);
    await user.type(bioTextarea, "更新済みの自己紹介");

    const avatarInput = screen.getByLabelText("アイコン URL");
    await user.clear(avatarInput);
    await user.type(avatarInput, "https://example.com/new.png");

    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/users/1");
    });
    expect(refreshAuthMock).toHaveBeenCalled();
  });
});

  it("本人以外がアクセスするとプロフィールへリダイレクト (TEST-10-06)", async () => {
    const profile = buildProfile({ id: 2, is_self: false });
    server.use(
      http.get(`${API_BASE_URL}/users/2`, () =>
        HttpResponse.json({ status: "success", data: profile }, { status: 200 }),
      ),
    );

    await renderWithSWR(<EditProfilePage params={{ id: "2" }} />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/users/2");
    });
  });

  it("未ログイン時はログインへリダイレクト (TEST-10-07)", async () => {
    setAuthMockState({ user: null });
    server.use(
      http.get(`${API_BASE_URL}/users/1`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "UNAUTHORIZED", message: "ログインが必要です" },
          },
          { status: 401 },
        ),
      ),
    );

    await renderWithSWR(<EditProfilePage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });

  it("アイコンURLが不正な場合はエラーを表示する (TEST-10-08)", async () => {
    server.use(
      http.get(`${API_BASE_URL}/users/1`, () =>
        HttpResponse.json({ status: "success", data: buildProfile() }, { status: 200 }),
      ),
      http.patch(`${API_BASE_URL}/profile`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "VALIDATION_ERROR", message: "アイコンURLが不正です" },
          },
          { status: 422 },
        ),
      ),
    );

    await renderWithSWR(<EditProfilePage params={{ id: "1" }} />);

    const avatarInput = await screen.findByLabelText("アイコン URL");
    const user = userEvent.setup();
    await user.clear(avatarInput);
    await user.type(avatarInput, "ftp://example.com/icon.png");

    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("アイコンURLが不正です")).toBeInTheDocument();
  });

  it("アイコンURLを空にして送信するとフォールバックに戻る", async () => {
    let profile = buildProfile();

    server.use(
      http.get(`${API_BASE_URL}/users/1`, () =>
        HttpResponse.json({ status: "success", data: profile }, { status: 200 }),
      ),
      http.patch(`${API_BASE_URL}/profile`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.icon_url).toBeNull();
        profile = buildProfile({ icon_url: null });
        return HttpResponse.json(
          { status: "success", data: profile },
          { status: 200 },
        );
      }),
    );

    await renderWithSWR(<EditProfilePage params={{ id: "1" }} />);

    const avatarInput = await screen.findByLabelText("アイコン URL");
    const user = userEvent.setup();
    await user.clear(avatarInput);

    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/users/1");
    });
    expect(refreshAuthMock).toHaveBeenCalled();
  });
