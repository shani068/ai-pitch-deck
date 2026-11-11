import { Container } from "@/components/site/container";

// Only claims the product backs today: slide count (schema), two agents (generator + evaluator
// guardrail), one image per slide (workflow), and a few-minute run (observed end to end).
const FACTS = [
  { value: "5 to 8", label: "slides in every deck" },
  { value: "2 agents", label: "one writes, one reviews" },
  { value: "1 image", label: "generated for each slide" },
  { value: "Minutes", label: "from idea to finished deck" },
];

export function Facts() {
  return (
    <section aria-label="At a glance" className="border-y border-border bg-card">
      <Container>
        <dl className="grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x">
          {FACTS.map((fact) => (
            <div key={fact.value} className="flex flex-col gap-1 px-2 py-7 sm:px-6 lg:py-9">
              <dt className="order-2 text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="order-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
