import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resetNextNavigationMocks,
  setMockSearchParams,
} from "@/test/mocks/next-navigation";
import { server } from "@/test/server";

vi.mock("@/components/ui/select", () => {
  const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  );

  const collectItems = (children: React.ReactNode): React.ReactElement[] => {
    const items: React.ReactElement[] = [];
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === SelectItem) {
        items.push(child);
      } else if (child.props?.children) {
        items.push(...collectItems(child.props.children));
      }
    });
    return items;
  };

  const Select = ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => {
    const items = collectItems(children);
    return (
      <select
        aria-label="お問い合わせ種別 *"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      >
        <option value="" disabled>
          選択してください
        </option>
        {items}
      </select>
    );
  };

  const passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  const SelectValue = ({ placeholder }: { placeholder?: string }) =>
    placeholder ? <option value="">{placeholder}</option> : null;

  return {
    Select,
    SelectTrigger: passthrough,
    SelectContent: passthrough,
    SelectItem,
    SelectValue,
  };
});

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

describe("ContactPage", () => {
  afterEach(() => {
    resetNextNavigationMocks();
  });

  it("クエリの postId を自動入力する", async () => {
    setMockSearchParams({ postId: "45" });
    const ContactPage = (await import("@/app/contact/page")).default;

    render(<ContactPage />);

    expect(await screen.findByLabelText("対象の投稿 ID")).toHaveValue(45);
  });

  it("フォーム送信で成功メッセージを表示する", async () => {
    const ContactPage = (await import("@/app/contact/page")).default;
    const user = userEvent.setup();
    let requestBody: Record<string, unknown> | null = null;

    server.use(
      http.post(`${API_BASE_URL}/reports`, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { status: "success", data: { message: "報告を受け付けました" } },
          { status: 200 },
        );
      }),
    );

    render(<ContactPage />);

    await user.selectOptions(screen.getByLabelText("お問い合わせ種別 *"), "report");
    await user.type(screen.getByLabelText("メールアドレス *"), "reporter@example.com");
    await user.type(screen.getByLabelText("お問い合わせ内容 *"), "テスト投稿です");

    await user.click(screen.getByRole("button", { name: "送信する" }));

    await waitFor(() => {
      expect(screen.getByText("送信が完了しました")).toBeInTheDocument();
    });

    expect(requestBody).toMatchObject({
      category: "report",
      message: "テスト投稿です",
      email: "reporter@example.com",
    });
  });

  it("API エラー時にエラーメッセージを表示して再送可能とする", async () => {
    const ContactPage = (await import("@/app/contact/page")).default;
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/reports`, () =>
        HttpResponse.json(
          {
            status: "error",
            error: { code: "SERVER_ERROR", message: "システムエラー" },
          },
          { status: 500 },
        ),
      ),
    );

    render(<ContactPage />);

    await user.selectOptions(screen.getByLabelText("お問い合わせ種別 *"), "report");
    await user.type(screen.getByLabelText("メールアドレス *"), "user@example.com");
    await user.type(screen.getByLabelText("お問い合わせ内容 *"), "内容です");

    await user.click(screen.getByRole("button", { name: "送信する" }));

    await waitFor(() => {
      expect(screen.getByText("送信に失敗しました")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "送信する" })).toBeEnabled();
  });
});
