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
  return db.orm.public.Deck.select("idea", "status", "userId").first({ id });
}

/** The most decks the "My decks" page lists. */
export const MAX_LISTED_DECKS = 100;

/**
 * The signed-in owner's decks, newest first, for the "My decks" page. `userId` must come from the
 * server-side session, never from the request. Slides bring only their order and image, for the
 * cover and the slide count. The idea is included because the list is shown only to its owner,
 * and it names decks that have no title yet.
 */
export async function getDecksForOwner(userId: string) {
  return db.orm.public.Deck.select("id", "title", "idea", "status", "createdAt")
    .where({ userId })
    .include("slides", (slide) => slide.select("order", "imageUrl").orderBy((s) => s.order.asc()))
    .orderBy((d) => d.createdAt.desc())
    .limit(MAX_LISTED_DECKS)
    .all();
}

export type DeckListItem = Awaited<ReturnType<typeof getDecksForOwner>>[number];
