import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AlertCircleIcon, ClockIcon } from "@/src/components/icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { currentPollPlan, type DeckStatus } from "@/src/decks/polling";
import { getDeckForView, type DeckForView } from "@/src/decks/queries";
import { DeckIdSchema } from "@/src/decks/validation";

import { CheckAgainButton, DeckStatusPoller } from "./deck-status-poller";
import { DeckPresenter } from "./deck-presenter";
import { RetryForm } from "./retry-form";
import { DeckStatusBadge } from "../../_components/deck-status-badge";
import { allowedImageUrl, isDrawnSlideImage } from "../../_components/slide-image-url";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const GENERIC_FAILURE_MESSAGE = "The pitch deck could not be generated. Please try again.";

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

  const complete = deck.status === "COMPLETE";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <span>Pitch deck</span>
          {complete ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {deck.slides.length} {deck.slides.length === 1 ? "slide" : "slides"}
              </span>
              <span aria-hidden="true">·</span>
              <time dateTime={deck.createdAt.toISOString()}>
                {dateFormat.format(deck.createdAt)}
              </time>
            </>
          ) : (
            <DeckStatusBadge
              status={deck.status}
              className="font-sans tracking-normal normal-case"
            />
          )}
        </p>
        <h1 className="max-w-4xl text-3xl leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-4xl">
          {complete && deck.title ? deck.title : "Your pitch deck"}
        </h1>
        {/* One live region in every state, so status changes are announced after a refresh. Once
            the deck is ready, the slides say so on their own; the sentence stays for screen readers. */}
        <output
          aria-live="polite"
          className={cn("flex items-center gap-2 text-muted-foreground", complete && "sr-only")}
        >
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
    // Only what a slide shows is sent to the browser, with image URLs checked here on the server.
    const slides = deck.slides.map((slide) => {
      const imageUrl = allowedImageUrl(slide.imageUrl);
      return {
        title: slide.title,
        content: slide.content,
        imagePrompt: slide.imagePrompt,
        imageUrl,
        imageIsSlide: imageUrl !== null && isDrawnSlideImage(imageUrl),
      };
    });
    return <DeckPresenter deckTitle={deck.title || "Pitch deck"} slides={slides} />;
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

  // The presenter's shape: the slide rail beside (or below) the canvas and its toolbar.
  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-2xl border bg-card lg:grid-cols-[11rem_minmax(0,1fr)]"
      aria-hidden="true"
    >
      <div className="flex min-w-0 flex-col">
        <div className="bg-muted/60 p-3 sm:p-6 lg:p-8">
          <Skeleton className="aspect-[3/2] w-full rounded-lg bg-foreground/5" />
        </div>
        <div className="flex h-14 items-center justify-between gap-3 border-t px-3 sm:px-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden border-t p-3 lg:order-first lg:flex-col lg:border-t-0 lg:border-r">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex w-32 shrink-0 gap-2 lg:w-auto">
            <Skeleton className="h-3 w-4" />
            <Skeleton className="aspect-[3/2] flex-1 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
