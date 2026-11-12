import { Container } from "@/components/site/container";
import { ChevronDownIcon } from "@/src/components/icons";

import { SectionHeading } from "./section-heading";

// Answers must stay true to the current product. "Who can see my deck?" changes again when decks
// become owner-only (the add-my-decks change); update it there.
const QUESTIONS = [
  {
    question: "What do I get?",
    answer:
      "A pitch deck of 5 to 8 slides, each with a title, a few sentences of content and its own image. The usual order is problem, solution, market, business model, go-to-market and your ask.",
  },
  {
    question: "How long does it take?",
    answer:
      "Usually a few minutes. Your deck's page updates by itself while it is being written, reviewed and illustrated.",
  },
  {
    question: "Who can see my deck?",
    answer:
      "Anyone who has its link. You need an account to create a deck, but decks aren't private to your account yet, so don't put confidential details in your idea. Deck pages are hidden from search engines.",
  },
  {
    question: "What makes a good idea?",
    answer:
      "Say who the customer is, what problem you solve for them and how you will make money. A short paragraph with those three things beats a long one without them.",
  },
  {
    question: "Does it make up numbers?",
    answer:
      "It is instructed not to invent traction, revenue, customers or market figures. Numbers are framed as targets or assumptions to validate.",
  },
  {
    question: "What if my deck isn't approved?",
    answer:
      "The deck page shows what the reviewer found missing. Choose Try again to generate a new deck from the same idea, or start over with a more specific one.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-border bg-muted/50 py-20 sm:py-24"
    >
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          id="faq-title"
          label="FAQ"
          title="Questions founders ask"
          description="Short answers about what you get, how it works and who can see it."
        />
        <div className="divide-y divide-border border-y border-border">
          {QUESTIONS.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex list-none items-center justify-between gap-6 rounded-md py-5 font-medium outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="pb-5 leading-relaxed text-pretty text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
