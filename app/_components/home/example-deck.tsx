import Link from "next/link";

import { SAMPLE_DECK, SAMPLE_SLIDE_LABELS } from "@/app/_content/sample-deck";
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/site/container";
import { CREATE_DECK_HREF } from "@/components/site/nav-links";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  PencilEditIcon,
  ShieldCheckIcon,
  SparkleAi01Icon,
} from "@/src/components/icons";

import { SectionHeading } from "./section-heading";

const number = (n: number) => String(n).padStart(2, "0");
const LAST = SAMPLE_DECK.slides.length - 1;

/**
 * The idea as it was typed, a "generated" connector, then the deck it produced: every slide's
 * real text on slide-like cards inside a tinted panel. The opening slide and the ask are wider on
 * large screens, and the ask is set in the brand colour as the deck's closing beat.
 */
export function ExampleDeck() {
  return (
    <section id="example" aria-labelledby="example-title" className="py-20 sm:py-28">
      <Container className="flex flex-col gap-12 sm:gap-14">
        <SectionHeading
          id="example-title"
          label="Example"
          title="A real deck, generated from one sentence"
          description="This is the generator's actual output for the idea below, shown as written."
        />

        <div className="flex flex-col">
          {/* The idea */}
          <figure className="flex flex-col gap-5 rounded-3xl bg-card p-6 text-card-foreground shadow-sm ring-1 shadow-primary/5 ring-foreground/8 sm:flex-row sm:items-start sm:p-8 dark:ring-foreground/10">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-primary/8 ring-1 ring-primary/15"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20">
                <PencilEditIcon className="size-5" />
              </span>
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <figcaption className="text-sm font-semibold text-primary">The idea</figcaption>
              <blockquote className="text-lg leading-relaxed text-pretty sm:text-xl">
                &ldquo;{SAMPLE_DECK.idea}&rdquo;
              </blockquote>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {SAMPLE_DECK.idea.length} characters
              </p>
            </div>
          </figure>

          {/* Connector */}
          <div aria-hidden="true" className="flex flex-col items-center">
            <span className="h-8 w-0 border-l border-dashed border-primary/40" />
            <span className="rounded-full bg-linear-to-r from-primary via-highlight to-primary p-px shadow-lg shadow-primary/20">
              <span className="flex items-center gap-2 rounded-full bg-card/95 px-4 py-1.5 text-sm font-semibold backdrop-blur-xl">
                <SparkleAi01Icon className="size-4 text-primary" />
                Generated deck
              </span>
            </span>
            <span className="h-8 w-0 border-l border-dashed border-primary/40" />
          </div>

          {/* The deck */}
          <div className="relative overflow-hidden rounded-3xl bg-secondary/60 p-3 ring-1 ring-primary/10 sm:p-5 dark:bg-secondary/40 dark:ring-foreground/10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-[10%] h-64 w-1/2 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute right-[5%] -bottom-24 h-64 w-1/2 rounded-full bg-highlight/10 blur-3xl" />
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-3 px-2 pt-2 pb-5 sm:px-3 sm:pt-3 sm:pb-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm ring-1 ring-foreground/8">
                  <LogoMark className="size-6" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-balance sm:text-xl">
                  {SAMPLE_DECK.deckTitle}
                </h3>
              </div>
              <p className="flex items-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-card px-3 py-1 tabular-nums ring-1 ring-foreground/8">
                  {SAMPLE_DECK.slides.length} slides
                </span>
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary">
                  <ShieldCheckIcon aria-hidden="true" className="size-3.5" />
                  Reviewed
                </span>
              </p>
            </div>

            <ol className="relative grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {SAMPLE_DECK.slides.map((slide, index) => {
                const first = index === 0;
                const last = index === LAST;
                return (
                  <li
                    key={slide.title}
                    className={cn(
                      "flex flex-col gap-4 rounded-2xl p-5 shadow-sm transition-[translate,box-shadow] duration-500 ease-apple hover:-translate-y-1 hover:shadow-lg sm:p-6",
                      last
                        ? "bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 lg:col-span-2"
                        : "bg-card text-card-foreground ring-1 shadow-primary/5 ring-foreground/8 hover:shadow-primary/10 dark:ring-foreground/10",
                      first && "sm:col-span-2 lg:flex-row lg:items-stretch lg:gap-6",
                    )}
                  >
                    <div className="flex flex-1 flex-col gap-3">
                      <span className="flex items-center justify-between gap-3 text-xs">
                        <span
                          className={cn(
                            "font-semibold",
                            last ? "text-primary-foreground" : "text-primary",
                          )}
                        >
                          {SAMPLE_SLIDE_LABELS[index]}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-mono tabular-nums",
                            last
                              ? "bg-primary-foreground/15 text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {number(index + 1)} / {number(SAMPLE_DECK.slides.length)}
                        </span>
                      </span>
                      <h4
                        className={cn(
                          "font-heading leading-snug font-semibold tracking-tight text-balance",
                          first || last ? "text-xl sm:text-2xl" : "text-lg",
                        )}
                      >
                        {slide.title}
                      </h4>
                      <p
                        className={cn(
                          "text-sm leading-relaxed text-pretty",
                          last ? "text-primary-foreground/85" : "text-muted-foreground",
                        )}
                      >
                        {slide.content}
                      </p>
                    </div>

                    {/* The ask closes the deck, and the section, with the way to make your own. */}
                    {last ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/20 pt-4">
                        <span className="text-sm font-medium text-primary-foreground/85">
                          Your idea could be next.
                        </span>
                        <Link
                          href={CREATE_DECK_HREF}
                          className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-foreground px-4 text-sm font-semibold text-primary transition-[translate,scale] duration-500 ease-apple outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-primary-foreground/50 active:translate-y-0 active:scale-[0.97] active:duration-150"
                        >
                          Create your deck
                          <ArrowRightIcon
                            aria-hidden="true"
                            className="size-4 transition-transform duration-300 ease-apple group-hover:translate-x-0.5"
                          />
                        </Link>
                      </div>
                    ) : null}

                    {/* The opening slide gets an abstract "slide image" in the brand colours. */}
                    {first ? (
                      <div
                        aria-hidden="true"
                        className="relative hidden min-h-40 w-2/5 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-primary via-primary/70 to-highlight lg:block"
                      >
                        <span className="absolute -top-8 -right-8 size-32 rounded-full bg-primary-foreground/20" />
                        <span className="absolute -bottom-10 -left-6 size-36 rounded-full bg-highlight/70 blur-md" />
                        <span className="absolute right-4 bottom-4 left-4 flex h-1/2 items-end gap-2">
                          {[45, 70, 55, 90].map((height) => (
                            <span
                              key={height}
                              className="flex-1 rounded-sm bg-primary-foreground/70"
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </span>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
