import { describe, expect, it } from "vite-plus/test";

import { safeNextPath } from "./redirect";

describe("safeNextPath", () => {
  it("returns an allowlisted path", () => {
    expect(safeNextPath("/new")).toBe("/new");
  });

  it.each([
    null,
    undefined,
    "",
    "/",
    "/new/",
    "/new?x=1",
    "/decks/abc",
    "//evil.example",
    "https://evil.example/new",
    "/\\evil.example",
    "javascript:alert(1)",
  ])("falls back to the home page for %s", (next) => {
    expect(safeNextPath(next)).toBe("/");
  });
});
