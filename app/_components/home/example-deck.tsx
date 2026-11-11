import { SAMPLE_DECK } from "@/app/_content/sample-deck";
import { Container } from "@/components/site/container";

import { SectionHeading } from "./section-heading";

export function ExampleDeck() {
  return (
    <section id="example" aria-labelledby="example-title" className="py-20 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="example-title"
          label="Example"
          title="A real deck, generated from one sentence"
          description="This is the generator's actual output for the idea below, shown as written."
        />

        <div className="flex flex-col gap-6">
          <blockquote className="max-w-3xl border-l-2 border-highlight pl-4 text-muted-foreground">
            <p className="text-sm font-medium text-foreground">The idea</p>
            <p className="mt-1 leading-relaxed">&ldquo;{SAMPLE_DECK.idea}&rdquo;</p>
          </blockquote>

          <h3 className="text-2xl font-semibold tracking-tight">{SAMPLE_DECK.deckTitle}</h3>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_DECK.slides.map((slide, index) => (
              <li
                key={slide.title}
                className="flex flex-col gap-3 rounded-2xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10"
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(SAMPLE_DECK.slides.length).padStart(2, "0")}
                </span>
                <h4 className="font-heading text-lg leading-snug font-semibold tracking-tight">
                  {slide.title}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{slide.content}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
