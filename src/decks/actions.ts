"use server";

import { redirect } from "next/navigation";

import { getSession } from "@/src/auth/session";

import { getDeckForRetry } from "./queries";
import { createAndStartDeck, START_FAILED_MESSAGE } from "./start-generation";
import { DeckIdSchema, IdeaSchema } from "./validation";

/**
 * State returned to `useActionState`. Errors are always returned, never thrown, so no internal
 * error text reaches the browser.
 */
export type FormState = { status: "idle" } | { status: "error"; message: string };

const RETRY_UNAVAILABLE_MESSAGE = "This pitch deck can't be retried. Please start over.";
const SIGN_IN_REQUIRED_MESSAGE = "Please sign in to create a pitch deck.";

/**
 * Checks the session, validates the idea, creates a PENDING deck, starts generation and opens
 * the deck's page. Hiding the form from signed-out visitors is only UX: this check is the gate.
 */
export async function createDeck(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    return { status: "error", message: SIGN_IN_REQUIRED_MESSAGE };
  }

  const idea = IdeaSchema.safeParse(formData.get("idea"));
  if (!idea.success) {
    const message = idea.error.issues[0]?.message ?? "Please check your business idea.";
    return { status: "error", message };
  }

  const started = await createAndStartDeck(idea.data, session.user.id);
  if (!started.ok) {
    return { status: "error", message: started.message };
  }

  // `redirect` throws to navigate, so it stays outside any try/catch. The path is relative.
  redirect(`/decks/${started.deckId}`);
}

/**
 * Creates a new deck from a FAILED deck's stored idea and opens it. The failed deck is left
 * unchanged. `deckId` is bound on the client and can be forged, so it is validated here, the
 * idea is read on the server only, and only the deck's owner may retry it: a retry copies the
 * idea into a new deck, so anyone else could otherwise generate from someone else's idea.
 */
export async function retryDeck(deckId: unknown, _prevState: FormState): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    return { status: "error", message: SIGN_IN_REQUIRED_MESSAGE };
  }

  const id = DeckIdSchema.safeParse(deckId);
  if (!id.success) {
    return { status: "error", message: RETRY_UNAVAILABLE_MESSAGE };
  }

  let deck: Awaited<ReturnType<typeof getDeckForRetry>>;
  try {
    deck = await getDeckForRetry(id.data);
  } catch (error) {
    console.error("Could not load the deck to retry", id.data, error);
    return { status: "error", message: START_FAILED_MESSAGE };
  }

  if (!deck || deck.status !== "FAILED" || deck.userId !== session.user.id) {
    return { status: "error", message: RETRY_UNAVAILABLE_MESSAGE };
  }

  const started = await createAndStartDeck(deck.idea, session.user.id);
  if (!started.ok) {
    return { status: "error", message: started.message };
  }

  redirect(`/decks/${started.deckId}`);
}
