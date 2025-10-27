import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { mutate } from "swr";
import { server } from "./server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(async () => {
  server.resetHandlers();
  cleanup();
  await mutate(() => true, undefined, { revalidate: false });
});

afterAll(() => {
  server.close();
});
