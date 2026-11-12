"use client";

import { useEffect, useRef, useState } from "react";

import { SAMPLE_DECK } from "@/app/_content/sample-deck";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const STEP_MS = 3200;
const SLIDES = SAMPLE_DECK.slides;

/**
 * A deck editor built from tokens: a slide rail, the current slide and a floating "drafting"
 * status. It steps through the real sample deck once, then stops. It pauses while hovered or
 * focused, stops for good once a slide is picked, and never moves with reduced motion. The
 * changing status is decorative (`aria-hidden`), so screen readers are not interrupted.
 */
export function HeroPreview() {
  const figureRef = useRef<HTMLElement>(null);
  // Auto-advance counts steps; one full pass (step === SLIDES.length) ends on slide 1.
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const stopped = picked !== null || step >= SLIDES.length;
  const active = picked ?? step % SLIDES.length;

  useEffect(() => {
    if (stopped) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      // Hold still while the visitor is pointing at or tabbing through the preview.
      if (figureRef.current?.matches(":hover, :focus-within")) return;
      setStep((current) => current + 1);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [stopped]);

  const slide = SLIDES[active];
  const number = (n: number) => String(n).padStart(2, "0");

  return (
    <figure
      ref={figureRef}
      aria-label="Preview of a generated pitch deck"
      className="group/preview relative mx-auto w-full max-w-2xl pb-6"
    >
      <div className="rounded-[1.75rem] border border-border/80 bg-card/60 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl transition-[translate,scale,box-shadow] duration-700 ease-apple group-hover/preview:-translate-y-1.5 group-hover/preview:scale-[1.01] group-hover/preview:shadow-primary/20 dark:bg-card/40">
        {/* Window bar */}
        <div aria-hidden="true" className="flex h-9 items-center gap-1.5 px-3">
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="mx-auto max-w-[60%] truncate rounded-full bg-muted px-3 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
            {SAMPLE_DECK.deckTitle}
          </span>
          <span className="size-5 rounded-full bg-linear-to-br from-primary to-highlight opacity-80" />
        </div>

        <div className="grid gap-2 rounded-[1.25rem] bg-background/80 p-2 sm:grid-cols-[6.25rem_1fr]">
          {/* Slide rail */}
          <ol className="hidden h-[19rem] flex-col gap-2 overflow-hidden sm:flex">
            {SLIDES.map((item, index) => (
              <li key={item.title}>
                <button
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-pressed={index === active}
                  onClick={() => setPicked(index)}
                  className={cn(
                    "flex aspect-[16/10] w-full flex-col justify-between rounded-lg bg-card p-1.5 text-left ring-1 ring-foreground/10 transition-[translate,scale,box-shadow] duration-500 ease-apple outline-none hover:scale-[1.04] active:duration-150 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]",
                    index === active && "shadow-md ring-2 ring-primary",
                  )}
                >
                  <span className="font-mono text-[0.55rem] text-muted-foreground tabular-nums">
                    {number(index + 1)}
                  </span>
                  <span aria-hidden="true" className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "h-1 w-4/5 rounded-full transition-colors duration-500",
                        index === active ? "bg-primary" : "bg-foreground/20",
                      )}
                    />
                    <span className="h-1 w-3/5 rounded-full bg-foreground/10" />
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {/* Current slide */}
          <div className="relative grid aspect-[16/10] grid-cols-[1.15fr_0.85fr] sm:aspect-auto sm:h-[19rem] gap-4 overflow-hidden rounded-xl bg-card p-4 text-card-foreground ring-1 ring-foreground/10 sm:p-6">
            <div
              key={active}
              className="flex min-w-0 animate-rise flex-col [animation-duration:700ms]"
            >
              <span className="flex items-center gap-1.5 text-[0.65rem] font-medium text-muted-foreground sm:text-xs">
                <LogoMark className="size-4" />
                <span className="font-mono tabular-nums">
                  {number(active + 1)} / {number(SLIDES.length)}
                </span>
              </span>
              <p className="mt-auto font-heading text-base leading-tight font-semibold tracking-tight text-balance sm:text-xl xl:text-2xl">
                {slide.title}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:line-clamp-3 sm:text-sm">
                {slide.content}
              </p>
            </div>

            {/* Slide image placeholder: abstract shapes in the brand colours. */}
            <div
              aria-hidden="true"
              className="relative overflow-hidden rounded-lg bg-linear-to-br from-primary via-primary/70 to-highlight"
            >
              <span
                className="absolute -top-6 -right-6 size-24 rounded-full bg-primary-foreground/20 transition-transform duration-1000 ease-apple"
                style={{ transform: `translate(${-active * 4}px, ${active * 6}px)` }}
              />
              <span
                className="absolute -bottom-8 -left-4 size-28 rounded-full bg-highlight/70 blur-md transition-transform duration-1000 ease-apple"
                style={{ transform: `translate(${active * 5}px, ${-active * 3}px)` }}
              />
              <span className="absolute right-3 bottom-3 left-3 flex items-end gap-1.5">
                {[40, 65, 50, 85].map((height, index) => (
                  <span
                    key={height}
                    className="flex-1 rounded-sm bg-primary-foreground/70 transition-[height] duration-700 ease-apple"
                    style={{ height: `${((height + active * 9 * (index + 1)) % 70) + 20}%` }}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating status, like a live generation */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-4 rounded-full bg-linear-to-r from-primary via-highlight to-primary p-px shadow-xl shadow-primary/20 sm:left-8"
      >
        <div className="flex items-center gap-2.5 rounded-full bg-card/95 px-4 py-2 text-sm font-medium text-card-foreground backdrop-blur-xl">
          <LogoMark className="size-5" />
          <span className="tabular-nums">
            {stopped ? "Deck ready" : `Drafting slide ${active + 1} of ${SLIDES.length}`}
          </span>
          {stopped ? null : (
            <span className="flex items-center gap-0.5">
              <span className="size-1 animate-typing rounded-full bg-primary" />
              <span className="size-1 animate-typing rounded-full bg-primary [animation-delay:150ms]" />
              <span className="size-1 animate-typing rounded-full bg-primary [animation-delay:300ms]" />
            </span>
          )}
        </div>
      </div>

      <figcaption className="sr-only">
        Slides from the example deck &ldquo;{SAMPLE_DECK.deckTitle}&rdquo;. Use the slide buttons to
        view each one.
      </figcaption>
    </figure>
  );
}
