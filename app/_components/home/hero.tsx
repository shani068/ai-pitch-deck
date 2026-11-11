import { Container } from "@/components/site/container";

import { IdeaForm } from "../idea-form";
import { SlideStack } from "./slide-stack";

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-highlight" />
              For early-stage founders
            </p>
            <h1
              id="hero-title"
              className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              Turn one idea into an <span className="text-primary">investor-ready</span> pitch deck.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
              Describe your business in a few sentences. AI Pitch Deck writes a 5 to 8 slide
              investor story, has an independent reviewer check it, and gives every slide its own
              image.
            </p>
          </div>

          <div
            id="create"
            className="rounded-2xl bg-card p-5 text-card-foreground shadow-sm ring-1 ring-foreground/10 sm:p-6"
          >
            <IdeaForm />
          </div>
        </div>

        <SlideStack />
      </Container>
    </section>
  );
}
