import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AlertCircleIcon, ClockIcon } from "@/src/components/icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { currentPollPlan, type DeckStatus } from "@/src/decks/polling";
import { getDeckForView, type DeckForView } from "@/src/decks/queries";
import { DeckIdSchema } from "@/src/decks/validation";

import { CheckAgainButton, DeckStatusPoller } from "./deck-status-poller";
import { RetryForm } from "./retry-form";
import { SlideCard } from "./slide-card";

const GENERIC_FAILURE_MESSAGE = "The pitch deck could not be generated. Please try again.";

const BADGES: Record<
  DeckStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Queued", variant: "secondary" },
  GENERATING: { label: "Generating", variant: "default" },
  COMPLETE: { label: "Ready", variant: "outline" },
  FAILED: { label: "Failed", variant: "destructive" },
};

const STATUS_TEXT: Record<DeckStatus, string> = {
  PENDING: "Your pitch deck is queued and will start generating shortly.",
  GENERATING: "Writing your deck and creating slide images. This usually takes a few minutes.",
  COMPLETE: "Your pitch deck is ready.",
  FAILED: "Your pitch deck could not be generated.",
};

export async function DeckView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deckId = DeckIdSchema.safeParse(id);
  if (!deckId.success) notFound();

  await connection();
  const deck = await getDeckForView(deckId.data);
  if (!deck) notFound();

  // The clock is read after the request-time query, as Cache Components requires.
  const plan = currentPollPlan(deck.status, deck.createdAt);
  const stale = plan.kind === "stale";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge variant={BADGES[deck.status].variant}>{BADGES[deck.status].label}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {deck.status === "COMPLETE" && deck.title ? deck.title : "Your pitch deck"}
        </h1>
        {/* One live region in every state, so status changes are announced after a refresh. */}
        <output aria-live="polite" className="flex items-center gap-2 text-muted-foreground">
          {plan.kind === "poll" ? <Spinner aria-hidden="true" /> : null}
          {stale ? "This is taking longer than expected." : STATUS_TEXT[deck.status]}
        </output>
      </header>

      {plan.kind === "poll" ? <DeckStatusPoller refreshInMs={plan.refreshInMs} /> : null}
      <DeckBody deck={deck} stale={stale} />
    </div>
  );
}

function DeckBody({ deck, stale }: { deck: DeckForView; stale: boolean }) {
  if (deck.status === "COMPLETE") {
    return (
      <ol className="flex flex-col gap-6" aria-label="Slides">
        {deck.slides.map((slide, index) => (
          <li key={slide.order}>
            <SlideCard slide={slide} index={index} />
          </li>
        ))}
      </ol>
    );
  }

  if (deck.status === "FAILED") {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>We couldn&apos;t generate this pitch deck</AlertTitle>
          <AlertDescription>{deck.errorMessage || GENERIC_FAILURE_MESSAGE}</AlertDescription>
        </Alert>
        <RetryForm deckId={deck.id} />
      </div>
    );
  }

  if (stale) {
    return (
      <div className="flex flex-col gap-5">
        <Alert>
          <ClockIcon aria-hidden="true" />
          <AlertTitle>Still working on it</AlertTitle>
          <AlertDescription>
            Generation may still be queued or running. Check again in a little while; your deck will
            appear here when it is ready.
          </AlertDescription>
        </Alert>
        <div>
          <CheckAgainButton />
        </div>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-6" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <li
          key={index}
          className="grid overflow-hidden rounded-xl ring-1 ring-foreground/10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col justify-center gap-3 p-5 sm:p-8">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </li>
      ))}
    </ol>
  );
}
