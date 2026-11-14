import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/site/container";
import { CREATE_DECK_HREF } from "@/components/site/nav-links";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/src/auth/session";
import { LayerThreeIcon, PlusIcon } from "@/src/components/icons";
import { getDecksForOwner, MAX_LISTED_DECKS, type DeckListItem } from "@/src/decks/queries";

import { DeckCover } from "./_components/deck-cover";
import { DeckStatusBadge } from "./_components/deck-status-badge";
import { allowedImageUrl } from "./_components/slide-image-url";

export const metadata: Metadata = {
  title: "My decks",
  robots: { index: false, follow: false },
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const IDEA_PREVIEW_LENGTH = 90;

/**
 * Every deck the signed-in user has created, newest first; each card opens the deck's slides.
 * The heading is static; the list streams in once the session has been checked on the server.
 * `proxy.ts` redirects visitors without a session cookie earlier, but only this check is the gate.
 */
export default function MyDecksPage() {
  return (
    <main className="flex-1">
      <Container className="flex max-w-6xl flex-col gap-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              My decks
            </h1>
            <p className="text-pretty text-muted-foreground">
              Every pitch deck you have generated. Open one to see all of its slides.
            </p>
          </div>
          <Button asChild size="lg" className="h-10 rounded-full px-4 font-semibold">
            <Link href={CREATE_DECK_HREF}>
              <PlusIcon aria-hidden="true" data-icon="inline-start" />
              New deck
            </Link>
          </Button>
        </div>

        <Suspense fallback={<DeckGridSkeleton />}>
          <OwnedDecks />
        </Suspense>
      </Container>
    </main>
  );
}

async function OwnedDecks() {
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/decks");

  // The owner comes from the server-side session only, so no one can list another user's decks.
  const decks = await getDecksForOwner(session.user.id);

  if (decks.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground tabular-nums">
        {decks.length === MAX_LISTED_DECKS
          ? `Your ${MAX_LISTED_DECKS} most recent decks`
          : `${decks.length} ${decks.length === 1 ? "deck" : "decks"}`}
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <li key={deck.id}>
            <DeckCard deck={deck} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeckCard({ deck }: { deck: DeckListItem }) {
  const name = deck.title || previewIdea(deck.idea);
  const cover = allowedImageUrl(deck.slides[0]?.imageUrl ?? null);
  const slideCount = deck.slides.length;

  return (
    <Link
      href={`/decks/${deck.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-[translate,box-shadow] duration-500 ease-apple outline-none hover:-translate-y-1 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="relative block aspect-[3/2] w-full overflow-hidden border-b bg-muted">
        <DeckCover src={cover} />
        <DeckStatusBadge status={deck.status} className="absolute top-3 left-3 shadow-sm" />
      </span>
      <span className="flex flex-1 flex-col gap-2 p-4">
        <span className="line-clamp-2 font-semibold tracking-tight text-balance">{name}</span>
        <span className="mt-auto flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
          {slideCount > 0 ? (
            <>
              <span>
                {slideCount} {slideCount === 1 ? "slide" : "slides"}
              </span>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <time dateTime={deck.createdAt.toISOString()}>{dateFormat.format(deck.createdAt)}</time>
        </span>
      </span>
    </Link>
  );
}

/** Untitled decks (queued, generating or failed) are named by the start of their idea. */
function previewIdea(idea: string): string {
  const text = idea.trim().replace(/\s+/g, " ");
  return text.length > IDEA_PREVIEW_LENGTH
    ? `${text.slice(0, IDEA_PREVIEW_LENGTH).trimEnd()}…`
    : text;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
        <LayerThreeIcon aria-hidden="true" className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">No decks yet</h2>
        <p className="max-w-sm text-pretty text-muted-foreground">
          Describe your business idea and your first pitch deck will appear here.
        </p>
      </div>
      <Button asChild size="lg" className="h-10 rounded-full px-4 font-semibold">
        <Link href={CREATE_DECK_HREF}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          Create your first deck
        </Link>
      </Button>
    </div>
  );
}

function DeckGridSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-4 w-20" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="overflow-hidden rounded-2xl border">
            <Skeleton className="aspect-[3/2] w-full rounded-none" />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
