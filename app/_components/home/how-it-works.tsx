import { Container } from "@/components/site/container";

import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    title: "Describe your idea",
    text: "Say who it's for, the problem it solves and how it makes money. Twenty characters is the minimum; a short paragraph is better.",
  },
  {
    title: "We draft the deck",
    text: "A writer agent builds a 5 to 8 slide investor story: problem, solution, market, business model, go-to-market and the ask.",
  },
  {
    title: "Reviewed, illustrated, ready",
    text: "An independent reviewer checks the deck against your idea, every slide gets an image, and the deck gets its own link.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="py-20 sm:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="how-it-works-title"
          label="How it works"
          title="From a few sentences to a finished deck"
          description="No templates to fill in and no slide editor to learn. You bring the idea; the deck follows."
        />
        <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex flex-col gap-3 md:pr-6">
              <div className="flex items-center gap-4">
                {/* Large numerals in the highlight colour meet the 3:1 large-text target. */}
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-card font-heading text-2xl font-semibold text-highlight tabular-nums">
                  {index + 1}
                </span>
                {index < STEPS.length - 1 ? (
                  <span aria-hidden="true" className="hidden h-px flex-1 bg-border md:block" />
                ) : null}
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
