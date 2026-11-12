import Link from "next/link";

import { Container } from "@/components/site/container";
import { CREATE_DECK_HREF } from "@/components/site/nav-links";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/src/components/icons";

import { HeroPreview } from "./hero-preview";

/**
 * Copy and two actions on the left, a live-looking deck editor on the right, over a soft indigo
 * and coral wash. Static: no session read, so the home page stays prerendered. Each block rises
 * in on load, a little after the one before it.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-x-clip">
      {/* The wash reaches up behind the see-through header. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-32 bottom-0">
        <div className="absolute -top-10 left-[8%] size-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-24 right-[4%] size-[34rem] rounded-full bg-highlight/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
      </div>

      <Container className="relative grid gap-14 pt-12 pb-16 sm:pt-16 sm:pb-24 lg:grid-cols-2 lg:items-center lg:gap-12 lg:pt-20 lg:pb-28">
        <div className="flex flex-col items-start gap-7">
          <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-highlight" />
            AI pitch deck generator
          </p>

          <h1
            id="hero-title"
            className="animate-rise text-[2.25rem] leading-[1.04] font-semibold tracking-[-0.035em] [animation-delay:80ms] min-[400px]:text-[2.6rem] sm:text-6xl lg:text-5xl xl:text-[3.5rem]"
          >
            One idea in.
            <br />
            An{" "}
            <span className="bg-linear-to-r from-primary to-highlight bg-clip-text whitespace-nowrap text-transparent">
              investor-ready
            </span>{" "}
            deck out.
          </h1>

          <p className="max-w-lg animate-rise text-lg leading-relaxed text-pretty text-muted-foreground [animation-delay:160ms] sm:text-xl">
            Describe your business in a few sentences. AI Pitch Deck writes a 5 to 8 slide investor
            story, has an independent reviewer check it, and gives every slide its own image.
          </p>

          <div className="flex animate-rise flex-wrap items-center gap-3 [animation-delay:240ms]">
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-full bg-foreground px-6 text-base font-semibold text-background shadow-lg shadow-foreground/15 transition-[translate,scale,background-color,box-shadow] duration-500 ease-apple active:duration-150 hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-xl hover:shadow-foreground/20 active:translate-y-0 active:scale-[0.97]"
            >
              <Link href={CREATE_DECK_HREF}>
                Create a deck
                <ArrowRightIcon
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-apple group-hover:translate-x-0.5"
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full bg-card/70 px-6 text-base font-semibold backdrop-blur-sm transition-[translate,scale,background-color] duration-500 ease-apple active:duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] dark:bg-card/50"
            >
              <Link href="/#example">See an example</Link>
            </Button>
          </div>

          <p className="animate-rise text-sm text-muted-foreground [animation-delay:320ms]">
            5 to 8 slides · independent review · an image for every slide
          </p>
        </div>

        <div className="animate-settle [animation-delay:200ms]">
          <HeroPreview />
        </div>
      </Container>
    </section>
  );
}
