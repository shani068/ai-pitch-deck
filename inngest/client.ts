import { eventType, Inngest } from "inngest";
import { z } from "zod";

export const deckGenerate = eventType("deck/generate", {
  schema: z.object({
    deckId: z.cuid2(),
  }),
});

export const inngest = new Inngest({
  id: "ai-pitch-deck",
});
