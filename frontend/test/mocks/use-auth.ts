import { vi } from "vitest";

export const refreshAuthMock = vi.fn();
export const logoutAuthMock = vi.fn();

type AuthStubState = {
  user: { id: number; name: string; email: string } | null;
  loading: boolean;
  error: string | null;
};

const defaultAuthState: AuthStubState = {
  user: { id: 1, name: "Tester", email: "tester@example.com" },
  loading: false,
  error: null,
};

let currentAuthState: AuthStubState = { ...defaultAuthState };

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: currentAuthState.user,
    loading: currentAuthState.loading,
    error: currentAuthState.error,
    refresh: refreshAuthMock,
    logout: logoutAuthMock,
  }),
}));

export function resetAuthMocks() {
  refreshAuthMock.mockClear();
  logoutAuthMock.mockClear();
  currentAuthState = { ...defaultAuthState };
}

export function setAuthMockState(state: Partial<AuthStubState>) {
  currentAuthState = { ...currentAuthState, ...state };
}
