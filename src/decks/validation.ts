import { z } from "zod";

// Shared by the idea form (UX only) and the Server Actions (the real check), so this module must
// stay free of `server-only`. The same limits are enforced again by the generation service:
// MIN_IDEA_LENGTH in src/ai/pitch-deck/guardrails.ts and MAX_IDEA_LENGTH in
// src/ai/pitch-deck/service.ts. Keep them in sync.
export const MIN_IDEA_LENGTH = 20;
export const MAX_IDEA_LENGTH = 2000;

export const IdeaSchema = z
  .string({ error: "Please describe your business idea as text." })
  .trim()
  .min(MIN_IDEA_LENGTH, {
    error: `Please describe your business idea in at least ${MIN_IDEA_LENGTH} characters.`,
  })
  .max(MAX_IDEA_LENGTH, {
    error: `Please keep your business idea under ${MAX_IDEA_LENGTH.toLocaleString("en-US")} characters.`,
  });

/** Deck ids are generated with cuid2 (`@onCreate(cuid(2))` in the data contract). */
export const DeckIdSchema = z.cuid2();
