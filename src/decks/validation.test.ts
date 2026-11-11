import { describe, expect, it } from "vite-plus/test";

import { DeckIdSchema, IdeaSchema, MAX_IDEA_LENGTH, MIN_IDEA_LENGTH } from "./validation";

describe("IdeaSchema", () => {
  it("rejects an idea one character under the minimum after trimming", () => {
    const result = IdeaSchema.safeParse(`  ${"a".repeat(MIN_IDEA_LENGTH - 1)}  `);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(`at least ${MIN_IDEA_LENGTH} characters`);
  });

  it("accepts an idea of exactly the minimum length", () => {
    expect(IdeaSchema.safeParse("a".repeat(MIN_IDEA_LENGTH)).success).toBe(true);
  });

  it("accepts an idea of exactly the maximum length", () => {
    expect(IdeaSchema.safeParse("a".repeat(MAX_IDEA_LENGTH)).success).toBe(true);
  });

  it("rejects an idea one character over the maximum", () => {
    const result = IdeaSchema.safeParse("a".repeat(MAX_IDEA_LENGTH + 1));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("under 2,000 characters");
  });

  it("trims surrounding whitespace", () => {
    const idea = "A marketplace for renting unused garage space.";
    expect(IdeaSchema.parse(`\n  ${idea}  \t`)).toBe(idea);
  });

  it.each([null, undefined, 42, {}])("rejects non-string input %j", (value) => {
    const result = IdeaSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Please describe your business idea as text.");
  });
});

describe("DeckIdSchema", () => {
  it("accepts a cuid2", () => {
    expect(DeckIdSchema.safeParse("tz4a98xxat96iws9zmbrgj3a").success).toBe(true);
  });

  it.each(["", "not a cuid", "../etc/passwd", "ABC-123"])("rejects %j", (value) => {
    expect(DeckIdSchema.safeParse(value).success).toBe(false);
  });
});
