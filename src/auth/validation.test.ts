import { describe, expect, it } from "vite-plus/test";

import {
  EmailSchema,
  fieldErrors,
  MAX_NAME_LENGTH,
  NameSchema,
  PasswordSchema,
  SignInSchema,
  SignUpSchema,
} from "./validation";

describe("NameSchema", () => {
  it("trims and accepts a normal name", () => {
    expect(NameSchema.parse("  Ada Lovelace  ")).toBe("Ada Lovelace");
  });

  it.each(["", "   "])("rejects an empty name %j", (value) => {
    expect(NameSchema.safeParse(value).success).toBe(false);
  });

  it("accepts exactly the maximum length and rejects one more", () => {
    expect(NameSchema.safeParse("a".repeat(MAX_NAME_LENGTH)).success).toBe(true);
    expect(NameSchema.safeParse("a".repeat(MAX_NAME_LENGTH + 1)).success).toBe(false);
  });
});

describe("EmailSchema", () => {
  it("trims and lower-cases", () => {
    expect(EmailSchema.parse("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it.each(["", "not-an-email", "a@", "@b.com"])("rejects %j", (value) => {
    const result = EmailSchema.safeParse(value);
    expect(result.success).toBe(false);
  });
});

describe("PasswordSchema", () => {
  it.each([
    [7, false],
    [8, true],
    [128, true],
    [129, false],
  ])("a %i-character password is valid: %j", (length, valid) => {
    expect(PasswordSchema.safeParse("x".repeat(length)).success).toBe(valid);
  });

  it("does not trim (spaces count as characters)", () => {
    expect(PasswordSchema.parse("  pass word  ")).toBe("  pass word  ");
  });
});

describe("SignUpSchema / SignInSchema", () => {
  it("returns one message per invalid field", () => {
    const result = SignUpSchema.safeParse({ name: "", email: "nope", password: "short" });
    expect(result.success).toBe(false);
    const errors = fieldErrors(result.error!);
    expect(Object.keys(errors).sort()).toEqual(["email", "name", "password"]);
    expect(errors.password).toContain("at least 8");
  });

  it("sign-in only requires a password to be present", () => {
    expect(SignInSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
    expect(SignInSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});
