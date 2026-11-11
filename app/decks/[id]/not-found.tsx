import Link from "next/link";

import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, FileIcon } from "@/src/components/icons";

export default function DeckNotFound() {
  return (
    <main className="flex-1">
      <Container className="flex max-w-5xl flex-col items-start gap-5 py-16 sm:py-24">
        <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
          <FileIcon aria-hidden="true" className="size-6" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pitch deck not found</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          This link doesn&apos;t match any pitch deck. Check that you copied the whole link.
        </p>
        <Button asChild variant="outline" size="lg">
          <Link href="/#create">
            <ArrowLeftIcon aria-hidden="true" />
            Create a new pitch deck
          </Link>
        </Button>
      </Container>
    </main>
  );
}
