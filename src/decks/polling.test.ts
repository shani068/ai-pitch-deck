import { describe, expect, it } from "vite-plus/test";

import { POLL_INTERVAL_MS, pollPlan, STALE_AFTER_MS, type DeckStatus } from "./polling";

const createdAt = new Date("2026-11-12T10:00:00Z");
const at = (ageMs: number) => createdAt.getTime() + ageMs;

describe("pollPlan", () => {
  it.each<DeckStatus>(["PENDING", "GENERATING"])("polls a fresh %s deck", (status) => {
    expect(pollPlan(status, createdAt, at(0))).toEqual({
      kind: "poll",
      refreshInMs: POLL_INTERVAL_MS,
    });
  });

  it.each<DeckStatus>(["PENDING", "GENERATING"])(
    "still polls a %s deck just under the threshold",
    (status) => {
      expect(pollPlan(status, createdAt, at(STALE_AFTER_MS - 1)).kind).toBe("poll");
    },
  );

  it.each<DeckStatus>(["PENDING", "GENERATING"])(
    "reports a %s deck as stale at the threshold",
    (status) => {
      expect(pollPlan(status, createdAt, at(STALE_AFTER_MS))).toEqual({ kind: "stale" });
    },
  );

  it.each<DeckStatus>(["COMPLETE", "FAILED"])("never polls a %s deck", (status) => {
    expect(pollPlan(status, createdAt, at(0))).toEqual({ kind: "done" });
    expect(pollPlan(status, createdAt, at(STALE_AFTER_MS * 2))).toEqual({ kind: "done" });
  });

  it("uses a 10-minute threshold", () => {
    expect(STALE_AFTER_MS).toBe(600_000);
  });
});
