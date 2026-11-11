"use client";

import { useActionState } from "react";
import Link from "next/link";
import { RefreshIcon } from "@/src/components/icons";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { retryDeck, type FormState } from "@/src/decks/actions";

const initialState: FormState = { status: "idle" };

/** "Try again" starts a new deck from the failed deck's idea; the server re-checks everything. */
export function RetryForm({ deckId }: { deckId: string }) {
  const [state, formAction, pending] = useActionState(retryDeck.bind(null, deckId), initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner aria-hidden="true" /> : <RefreshIcon aria-hidden="true" />}
          {pending ? "Starting…" : "Try again"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Start over</Link>
        </Button>
      </div>
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
