import Link from "next/link";

import { Container } from "@/components/site/container";
import { CREATE_DECK_HREF } from "@/components/site/nav-links";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/src/components/icons";

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-cta-title" className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-col items-start gap-8 rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <h2
              id="closing-cta-title"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Your next pitch starts with one paragraph.
            </h2>
            <p className="text-lg text-pretty opacity-90">
              Write what you are building. The deck, the review and the images follow.
            </p>
          </div>
          <Link
            href={CREATE_DECK_HREF}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 shrink-0 rounded-full bg-background px-6 text-base font-semibold text-foreground transition-[translate,scale,background-color] duration-500 ease-apple active:duration-150 hover:-translate-y-0.5 hover:bg-background/90 active:translate-y-0 active:scale-[0.97]",
            )}
          >
            Create your deck
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
