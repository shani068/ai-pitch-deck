import { describe, expect, it } from "vite-plus/test";

import { isUnrecoverableProviderError } from "./provider-errors";

describe("isUnrecoverableProviderError", () => {
  it.each([
    { status: 401, code: "expired_secret_key" },
    { status: 401, code: "invalid_api_key" },
    { status: 403, code: null },
    { status: 404, code: "model_not_found" },
    { status: 429, code: "insufficient_quota" },
  ])("stops retrying on $status $code", (error) => {
    expect(isUnrecoverableProviderError(error)).toBe(true);
  });

  it.each([
    { status: 429, code: "rate_limit_exceeded" },
    { status: 500, code: null },
    { status: 503, code: null },
    new Error("network down"),
    null,
    "401",
  ])("keeps retrying on %o", (error) => {
    expect(isUnrecoverableProviderError(error)).toBe(false);
  });
});
