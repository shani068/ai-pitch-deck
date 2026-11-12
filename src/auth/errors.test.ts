import { describe, expect, it } from "vite-plus/test";

import { GENERIC_AUTH_ERROR, toAuthFormError } from "./errors";

describe("toAuthFormError", () => {
  it.each(["INVALID_EMAIL_OR_PASSWORD", "INVALID_PASSWORD"])(
    "gives the same sign-in message for %s",
    (code) => {
      expect(toAuthFormError({ code, status: 401 })).toEqual({
        message: "Invalid email or password.",
      });
    },
  );

  it.each(["USER_ALREADY_EXISTS", "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"])(
    "points %s at the email field and suggests signing in",
    (code) => {
      expect(toAuthFormError({ code, status: 422 })).toEqual({
        field: "email",
        message: "An account with this email already exists.",
        suggestSignIn: true,
      });
    },
  );

  it.each([
    ["PASSWORD_TOO_SHORT", "password"],
    ["PASSWORD_TOO_LONG", "password"],
    ["INVALID_EMAIL", "email"],
    ["INVALID_NAME", "name"],
  ])("maps %s to the %s field", (code, field) => {
    expect(toAuthFormError({ code, status: 400 }).field).toBe(field);
  });

  it("treats status 429 as too many attempts, whatever the code", () => {
    expect(toAuthFormError({ code: "INVALID_EMAIL_OR_PASSWORD", status: 429 }).message).toContain(
      "Too many attempts",
    );
  });

  it.each([{ code: "SOMETHING_NEW", status: 500 }, null, undefined, {}])(
    "falls back to a generic message for %j",
    (error) => {
      expect(toAuthFormError(error)).toEqual({ message: GENERIC_AUTH_ERROR });
    },
  );
});
