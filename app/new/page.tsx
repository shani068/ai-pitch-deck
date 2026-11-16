import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/site/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/src/auth/session";

import { IdeaForm } from "../_components/idea-form";
import { DeckDraftDemo } from "./_components/deck-draft-demo";

export const metadata: Metadata = {
  title: "Create a pitch deck",
  robots: { index: false, follow: false },
};

/**
 * The idea form, for signed-in users only, beside a preview of what happens after "Generate". The
 * heading and preview are static; the form streams in once the session has been checked on the
 * server. `proxy.ts` redirects visitors without a session cookie earlier, but that is only a
 * shortcut: this check, and the one in `createDeck`, are the gates.
 */
export default function NewDeckPage() {
  return (
    <main className="flex-1">
      <Container className="grid gap-14 py-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] lg:gap-16 lg:py-20">
        <div className="flex min-w-0 flex-col gap-10">
          <header className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              New deck
            </p>
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
              Pitch it in one paragraph.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
              Say who it is for, what is broken for them and how you will make money. We write 5 to
              8 slides, have a reviewer check the story, and draw every slide.
            </p>
          </header>

          <Suspense fallback={<FormSkeleton />}>
            <SignedInIdeaForm />
          </Suspense>
        </div>

        <aside
          aria-label="What happens next"
          className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start"
        >
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            What happens next
          </p>
          <DeckDraftDemo />
        </aside>
      </Container>
    </main>
  );
}

async function SignedInIdeaForm() {
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/new");
  return <IdeaForm />;
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true">
      <Skeleton className="h-[19rem] w-full rounded-2xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-2 sm:grid-cols-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
