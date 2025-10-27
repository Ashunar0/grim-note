import { vi } from "vitest";

export const pushMock = vi.fn();
export const refreshMock = vi.fn();

const pathnameRef = { current: "/" };

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  usePathname: () => pathnameRef.current,
}));

export function setMockPathname(pathname: string) {
  pathnameRef.current = pathname;
}

export function resetNextNavigationMocks() {
  pushMock.mockClear();
  refreshMock.mockClear();
  pathnameRef.current = "/";
}
