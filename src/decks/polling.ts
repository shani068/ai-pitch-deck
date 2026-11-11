// Pure and free of `server-only`: the deck page decides on the server, and Vitest imports it.

export type DeckStatus = "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";

/** How often an open, in-progress deck page re-fetches its deck. */
export const POLL_INTERVAL_MS = 3000;

/** After this long in PENDING or GENERATING, the page stops polling and reports slowness. */
export const STALE_AFTER_MS = 10 * 60 * 1000;

export type PollPlan = { kind: "done" } | { kind: "poll"; refreshInMs: number } | { kind: "stale" };

/**
 * What the deck page should do next. Staleness is measured from `createdAt`, so it survives
 * reloads.
 */
export function pollPlan(status: DeckStatus, createdAt: Date, now: number): PollPlan {
  if (status === "COMPLETE" || status === "FAILED") return { kind: "done" };

  const age = now - createdAt.getTime();
  if (age >= STALE_AFTER_MS) return { kind: "stale" };

  return { kind: "poll", refreshInMs: POLL_INTERVAL_MS };
}

/**
 * `pollPlan` at the current time. Server Components render once per request, so reading the
 * clock here is request-time data, not an unstable render; call it after the request-time query.
 */
export function currentPollPlan(status: DeckStatus, createdAt: Date): PollPlan {
  return pollPlan(status, createdAt, Date.now());
}
