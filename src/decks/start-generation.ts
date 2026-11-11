import "server-only";

import { deckGenerate, inngest } from "@/inngest/client";
import { db } from "@/src/prisma/db";

export const START_FAILED_MESSAGE =
  "We couldn't start generating your pitch deck. Please try again in a moment.";

export type StartResult = { ok: true; deckId: string } | { ok: false; message: string };

/**
 * Creates a PENDING deck for an already validated idea and requests its background generation.
 * If the request cannot be sent, the deck is deleted again so no deck is left stranded in
 * PENDING. Deleting (rather than marking it FAILED) is safe even if the event did reach Inngest:
 * the run then finds no deck and fails without retrying, so nothing is generated or paid for.
 * Errors are logged without the idea, and only a generic message is returned.
 */
export async function createAndStartDeck(idea: string): Promise<StartResult> {
  let deckId: string;
  try {
    const deck = await db.orm.public.Deck.select("id").create({ idea });
    deckId = deck.id;
  } catch (error) {
    console.error("Could not create a deck", error);
    return { ok: false, message: START_FAILED_MESSAGE };
  }

  try {
    await inngest.send(deckGenerate.create({ deckId }));
  } catch (error) {
    console.error("Could not request deck generation", deckId, error);
    try {
      await db.orm.public.Deck.where({ id: deckId }).delete();
    } catch (cleanupError) {
      console.error("Could not delete the unstarted deck", deckId, cleanupError);
    }
    return { ok: false, message: START_FAILED_MESSAGE };
  }

  return { ok: true, deckId };
}
