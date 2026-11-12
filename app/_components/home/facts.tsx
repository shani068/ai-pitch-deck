import { Container } from "@/components/site/container";

// Only claims the product backs today: slide count (schema), two agents (generator + evaluator
// guardrail), one image per slide (workflow), and a few-minute run (observed end to end).
const FACTS = [
  { value: "5 to 8", label: "slides in every deck, from the problem to the ask." },
  { value: "2 agents", label: "one writes the story, an independent one reviews it." },
  { value: "1 image", label: "generated for each slide, so no slide is left bare." },
  { value: "Minutes", label: "from a few sentences to a finished deck." },
];

/**
 * Four frosted cards over a soft indigo and coral glow. The glow stays inside the section, and
 * the cards lift gently on hover with the same easing as the hero.
 */
export function Facts() {
  return (
    <section aria-label="At a glance" className="relative overflow-hidden py-10 sm:py-14">
      {/* The mask fades the glow out at the top and bottom, so the section has no hard edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mask-[linear-gradient(to_bottom,transparent,black_35%,black_65%,transparent)]"
      >
        <div className="absolute bottom-0 left-[-6%] h-56 w-[45%] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-2 left-[35%] h-48 w-[30%] rounded-full bg-highlight/10 blur-3xl" />
        <div className="absolute right-[-6%] bottom-0 h-64 w-[45%] rounded-full bg-primary/25 blur-3xl" />
      </div>

      <Container className="relative">
        <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {FACTS.map((fact) => (
            <div
              key={fact.value}
              className="flex flex-col gap-2 rounded-2xl bg-card/70 p-4 shadow-sm sm:gap-3 sm:p-6 ring-1 shadow-primary/5 ring-foreground/5 backdrop-blur-xl transition-[translate,box-shadow] duration-500 ease-apple hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 dark:bg-card/50 dark:ring-foreground/10"
            >
              <dt className="order-2 max-w-[17rem] text-sm leading-relaxed text-pretty text-muted-foreground sm:text-[0.95rem]">
                {fact.label}
              </dt>
              <dd className="order-1 font-heading text-2xl font-semibold tracking-tight whitespace-nowrap sm:text-3xl lg:text-[2.125rem]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
