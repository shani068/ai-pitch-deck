import Link from "next/link";

import { Container } from "@/components/site/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CREATE_DECK_HREF } from "@/components/site/nav-links";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, PlusIcon } from "@/src/components/icons";

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

/**
 * Heading and a "still deciding" card on the left (pinned on wide screens), numbered questions on
 * the right. One question is open at a time; the first starts open. The answer's height animates
 * both ways (Radix accordion), and the plus turns into a close mark.
 */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-border py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="faq-title"
            label="FAQ"
            title="Questions founders ask"
            description="Short answers about what you get, how it works and who can see it."
          />
          <div className="flex flex-col items-start gap-2 rounded-3xl bg-muted p-6 ring-1 ring-foreground/5 sm:max-w-sm dark:ring-foreground/10">
            <p className="font-semibold">Still deciding?</p>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              The quickest answer is your own idea. A deck takes a few minutes.
            </p>
            <Link
              href={CREATE_DECK_HREF}
              className={cn(
                buttonVariants(),
                "group mt-3 rounded-full bg-foreground px-4 font-semibold text-background transition-[translate,scale,background-color] duration-500 ease-apple hover:-translate-y-0.5 hover:bg-foreground/90 active:translate-y-0 active:scale-[0.97] active:duration-150",
              )}
            >
              Create a deck
              <ArrowRightIcon
                aria-hidden="true"
                className="transition-transform duration-300 ease-apple group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="faq-0" className="gap-3">
          {QUESTIONS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="rounded-2xl bg-muted ring-1 ring-transparent transition-[background-color,box-shadow] duration-500 ease-apple not-last:border-b-0 hover:bg-secondary/70 data-[state=open]:bg-card data-[state=open]:shadow-lg data-[state=open]:ring-foreground/8 data-[state=open]:shadow-primary/5 data-[state=open]:hover:bg-card dark:data-[state=open]:ring-foreground/10"
            >
              <AccordionTrigger className="items-center gap-4 rounded-2xl border-0 px-5 py-4 text-base hover:no-underline sm:px-6 sm:py-5 sm:text-lg **:data-[slot=accordion-trigger-icon]:hidden">
                <span className="w-5 shrink-0 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{item.question}</span>
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-sm ring-1 ring-foreground/8 transition-[background-color,color] duration-300 group-aria-expanded/accordion-trigger:bg-foreground group-aria-expanded/accordion-trigger:text-background group-aria-expanded/accordion-trigger:ring-transparent"
                >
                  <PlusIcon className="size-4 transition-transform duration-500 ease-apple group-aria-expanded/accordion-trigger:rotate-45" />
                </span>
              </AccordionTrigger>
              <AccordionContent className="pr-6 pb-5 pl-14 text-base leading-relaxed text-pretty text-muted-foreground sm:pr-16 sm:pl-15">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
