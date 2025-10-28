import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContactPage from "@/app/contact/page";

describe("ContactPage", () => {
  it("必須項目を表示する", () => {
    render(<ContactPage />);

    expect(
      screen.getByRole("heading", { name: "お問い合わせ" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス *")).toBeRequired();
    expect(screen.getByLabelText("お問い合わせ内容 *")).toBeRequired();
    expect(
      screen.getByRole("button", { name: "送信する" }),
    ).toBeInTheDocument();
  });
});
