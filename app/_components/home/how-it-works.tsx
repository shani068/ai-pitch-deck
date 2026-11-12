import { Container } from "@/components/site/container";

import { HowItWorksSteps } from "./how-it-works-steps";
import { SectionHeading } from "./section-heading";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      // No bottom padding: the pinned box already leaves room below its centred content.
      className="overflow-x-clip pt-20 sm:pt-28"
    >
      <Container className="flex flex-col gap-14 sm:gap-16">
        <SectionHeading
          id="how-it-works-title"
          label="How it works"
          title="From a few sentences to a finished deck"
          description="No templates to fill in and no slide editor to learn. You bring the idea; the deck follows."
          className="mx-auto items-center text-center"
        />
        <HowItWorksSteps />
      </Container>
    </section>
  );
}
