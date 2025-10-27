import { vi } from "vitest";

export const refreshAuthMock = vi.fn();
export const logoutAuthMock = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Tester", email: "tester@example.com" },
    loading: false,
    error: null,
    refresh: refreshAuthMock,
    logout: logoutAuthMock,
  }),
}));

export function resetAuthMocks() {
  refreshAuthMock.mockClear();
  logoutAuthMock.mockClear();
}
