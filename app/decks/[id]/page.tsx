import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/site/container";
import { Skeleton } from "@/components/ui/skeleton";

import { DeckView } from "./_components/deck-view";

// Static on purpose: metadata never needs a database read, and deck links are share links that
// search engines must not index.
export const metadata: Metadata = {
  title: "Pitch deck",
  robots: { index: false, follow: false },
};

export default function DeckPage({ params }: PageProps<"/decks/[id]">) {
  return (
    <main className="flex-1">
      <Container className="flex max-w-5xl flex-col gap-8 py-10 sm:py-14">
        <Suspense fallback={<DeckSkeleton />}>
          <DeckView params={params} />
        </Suspense>
      </Container>
    </main>
  );
}

function DeckSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24 rounded-4xl" />
        <Skeleton className="h-9 w-3/4" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
