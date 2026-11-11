import "server-only";

import { db } from "@/src/prisma/db";

/**
 * Everything the public deck page shows, and nothing more. The business idea is deliberately not
 * selected: deck links are share links, so the page must never be able to render it.
 * Returns `null` when no deck has this id. The read is uncached; callers run it at request time.
 */
export async function getDeckForView(id: string) {
  return db.orm.public.Deck.select("id", "title", "status", "errorMessage", "createdAt")
    .include("slides", (slide) =>
      slide
        .select("order", "title", "content", "imagePrompt", "imageUrl")
        .orderBy((s) => s.order.asc()),
    )
    .first({ id });
}

export type DeckForView = NonNullable<Awaited<ReturnType<typeof getDeckForView>>>;
export type SlideForView = DeckForView["slides"][number];

/** The fields a retry needs, read only on the server and never sent to the browser. */
export async function getDeckForRetry(id: string) {
  return db.orm.public.Deck.select("idea", "status").first({ id });
}
