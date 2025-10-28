import { vi } from "vitest";

export const pushMock = vi.fn();
export const refreshMock = vi.fn();

const pathnameRef = { current: "/" };
const searchParamsRef = { current: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  usePathname: () => pathnameRef.current,
  useSearchParams: () => searchParamsRef.current,
}));

export function setMockPathname(pathname: string) {
  pathnameRef.current = pathname;
}

export function setMockSearchParams(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      sp.set(key, value);
    }
  });
  searchParamsRef.current = sp;
}

export function resetNextNavigationMocks() {
  pushMock.mockClear();
  refreshMock.mockClear();
  pathnameRef.current = "/";
  searchParamsRef.current = new URLSearchParams();
}
