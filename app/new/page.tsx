import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/site/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/src/auth/session";

import { IdeaForm } from "../_components/idea-form";

export const metadata: Metadata = {
  title: "Create a pitch deck",
  robots: { index: false, follow: false },
};

/**
 * The idea form, for signed-in users only. The heading is static; the form streams in once the
 * session has been checked on the server. `proxy.ts` redirects visitors without a session cookie
 * earlier, but that is only a shortcut: this check, and the one in `createDeck`, are the gates.
 */
export default function NewDeckPage() {
  return (
    <main className="flex-1">
      <Container className="flex max-w-2xl flex-col gap-8 py-12 sm:py-20">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            What are you building?
          </h1>
          <p className="text-lg text-pretty text-muted-foreground">
            A few sentences are enough: who it is for, the problem it solves and how it makes money.
            You will get a 5 to 8 slide deck, reviewed and illustrated, in a few minutes.
          </p>
        </div>

        <div className="rounded-3xl bg-card p-5 text-card-foreground shadow-sm ring-1 ring-foreground/10 sm:p-7">
          <Suspense fallback={<FormSkeleton />}>
            <SignedInIdeaForm />
          </Suspense>
        </div>
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
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-11 w-48 rounded-lg" />
    </div>
  );
}
