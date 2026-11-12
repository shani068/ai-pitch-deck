"use client";

import { useEffect, useRef, useState } from "react";

import { SAMPLE_DECK } from "@/app/_content/sample-deck";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  CheckTickCircleIcon,
  PencilEditIcon,
  ShieldCheckIcon,
  SparkleAi01Icon,
} from "@/src/components/icons";

const STEPS = [
  {
    title: "Describe your idea",
    text: "Say who it's for, the problem it solves and how it makes money. Twenty characters is the minimum; a short paragraph is better.",
    Icon: PencilEditIcon,
  },
  {
    title: "We draft the deck",
    text: "A writer agent builds a 5 to 8 slide investor story: problem, solution, market, business model, go-to-market and the ask.",
    Icon: SparkleAi01Icon,
  },
  {
    title: "Reviewed, illustrated, ready",
    text: "An independent reviewer checks the deck against your idea, every slide gets an image, and the deck gets its own link.",
    Icon: ShieldCheckIcon,
  },
];

const EASE = "duration-700 ease-apple";

/**
 * The pinned scroll is measured in "units": one per step, plus a short hold at the end with every
 * step complete. Each unit is UNIT_SVH of scrolling. Within a unit, the first FILL share fills
 * the step's line and the rest holds the step fully shown before the next one takes over.
 */
const UNIT_SVH = 70;
const FILL = 0.7;
const HOLD_UNITS = 0.4;
const TOTAL_UNITS = STEPS.length + HOLD_UNITS;
/** Where the pinned content sits: just below the floating header. */
const PIN_TOP_REM = 5;
/** Where each step is fully shown (in units): its line is full and the next step hasn't begun. */
const STEP_SHOWN_UNITS = STEPS.map((_, index) => index + (1 + FILL) / 2);
/** Share of the remaining distance the shown position closes each frame (a short glide). */
const GLIDE = 0.18;
/** A step must be on screen this long before a fast scroll may carry the page past it. */
const MIN_STEP_MS = 450;
/** Scrolls this soon after wheel, touch or key input count as the visitor's own scrolling. */
const INPUT_WINDOW_MS = 1500;
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp"]);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Unit size, and conversions between the page's scroll position and units through the track. */
function trackGeometry(track: HTMLElement | null, pinned: HTMLElement | null) {
  if (!track || !pinned) return null;
  const unitPx = (track.offsetHeight - pinned.offsetHeight) / TOTAL_UNITS;
  if (unitPx <= 0) return null;
  const pinTop = parseFloat(getComputedStyle(pinned).top) || 0;
  const trackTop = track.getBoundingClientRect().top;
  return {
    units: Math.min(TOTAL_UNITS, Math.max(0, (pinTop - trackTop) / unitPx)),
    scrollYFor: (units: number) => window.scrollY + trackTop - pinTop + units * unitPx,
  };
}

/**
 * Scroll-driven steps, in the style of Apple's product pages. The steps (and, on wide screens,
 * the scene) stay pinned while a tall track scrolls past; the scroll position alone drives the
 * timeline, forwards and backwards, and nothing plays on its own. Only the active step shows its
 * line. Once the last step has held, the track ends and the page scrolls on.
 *
 * Scrolling at any normal pace is untouched. Only when the visitor's own fast scroll would carry
 * the page past a step that has been on screen for less than MIN_STEP_MS does the page rest at
 * that step for that long, so a fling still shows every step. Link and button scrolls, Home and
 * End, and reduced motion are never held. The scene is decorative (`aria-hidden`).
 */
export function HowItWorksSteps() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  // How far through the track the visitor has scrolled, in units (0 to TOTAL_UNITS).
  const [units, setUnits] = useState(0);

  const active = Math.min(STEPS.length - 1, Math.floor(units));
  const activeFill = clamp01((units - active) / FILL);

  useEffect(() => {
    let frame = 0;
    let shown = 0;
    let target = 0;
    let lastInputAt = -Infinity;
    // The step the scroll position is in (-1 before the track), and since when.
    let stepInView = -1;
    let stepSince = 0;
    let rest: { units: number; until: number } | null = null;

    function glide() {
      frame = 0;
      shown = reducedMotion() ? target : shown + (target - shown) * GLIDE;
      if (Math.abs(target - shown) < 0.002) shown = target;
      setUnits(Math.round(shown * 1000) / 1000);
      if (shown !== target) frame = window.requestAnimationFrame(glide);
    }

    function restAt(geometry: { scrollYFor: (units: number) => number }, units: number) {
      window.scrollTo({ top: geometry.scrollYFor(units), behavior: "instant" });
      return units;
    }

    function onScroll() {
      const geometry = trackGeometry(trackRef.current, pinnedRef.current);
      if (!geometry) return;
      const now = performance.now();
      const previous = target;
      let next = geometry.units;

      const ownScroll = now - lastInputAt < INPUT_WINDOW_MS;
      if (ownScroll && !reducedMotion()) {
        if (rest && now < rest.until && next > rest.units) {
          next = restAt(geometry, rest.units);
        } else {
          rest = null;
          // The first step boundary passed on the way down whose step was barely seen.
          const skipped = STEP_SHOWN_UNITS.findIndex(
            (units, index) =>
              previous <= units &&
              next > units &&
              !(stepInView === index && now - stepSince >= MIN_STEP_MS),
          );
          if (skipped !== -1) {
            next = restAt(geometry, STEP_SHOWN_UNITS[skipped]);
            rest = { units: next, until: now + MIN_STEP_MS };
          }
        }
      }

      const inView = next <= 0 ? -1 : Math.min(STEPS.length - 1, Math.floor(next));
      if (inView !== stepInView) {
        stepInView = inView;
        stepSince = now;
      }
      target = next;
      if (!frame) frame = window.requestAnimationFrame(glide);
    }

    function markInput() {
      lastInputAt = performance.now();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (SCROLL_KEYS.has(event.key)) markInput();
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", markInput, { passive: true });
    window.addEventListener("touchmove", markInput, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", markInput);
      window.removeEventListener("touchmove", markInput);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  /** Scrolls to the point where the step is fully shown. */
  function scrollToStep(index: number) {
    const geometry = trackGeometry(trackRef.current, pinnedRef.current);
    if (!geometry) return;
    window.scrollTo({
      top: geometry.scrollYFor(STEP_SHOWN_UNITS[index]),
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }

  const steps = (
    <ol className="flex flex-col">
      {STEPS.map((step, index) => {
        const selected = index === active;
        const done = index < active;
        // Only the active step shows its line; the previous one fades out as the next starts.
        const fill = selected ? activeFill : done ? 1 : 0;
        return (
          <li key={step.title} className="relative py-5 pl-6 short:py-3 sm:pl-8">
            <span
              aria-hidden="true"
              className="absolute inset-y-1 left-0 w-0.5 overflow-hidden rounded-full bg-border"
            >
              <span
                className={cn(
                  "block h-full origin-top rounded-full bg-foreground transition-opacity duration-500 ease-apple",
                  selected ? "opacity-100" : "opacity-0",
                )}
                style={{ transform: `scaleY(${fill})` }}
              />
            </span>
            <h3>
              <button
                type="button"
                aria-label={`Step ${index + 1}: ${step.title}`}
                aria-current={selected ? "step" : undefined}
                onClick={() => scrollToStep(index)}
                className="group/step flex w-full items-center gap-4 rounded-2xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 transition-[background-color,color,box-shadow,scale]",
                    EASE,
                    selected &&
                      "scale-105 bg-primary text-primary-foreground shadow-lg ring-primary shadow-primary/25",
                    done && "bg-card text-primary ring-primary/30",
                    !selected &&
                      !done &&
                      "bg-card text-foreground ring-foreground/10 group-hover/step:ring-foreground/25",
                  )}
                >
                  <step.Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    Step {index + 1}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-semibold tracking-tight transition-colors sm:text-xl",
                      EASE,
                      selected || done ? "text-foreground" : "text-foreground/60",
                    )}
                  >
                    {step.title}
                  </span>
                </span>
              </button>
            </h3>
            <p
              className={cn(
                "mt-2 ml-16 leading-relaxed text-pretty transition-colors short:text-sm",
                EASE,
                selected ? "text-muted-foreground" : "text-muted-foreground/70",
              )}
            >
              {step.text}
            </p>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="flex flex-col gap-14">
      {/* Narrow screens: the scene sits above, and only the steps are pinned. */}
      <div className="lg:hidden">
        <StageScene active={active} />
      </div>

      <div
        ref={trackRef}
        className="relative"
        style={{ height: `calc(100svh - ${PIN_TOP_REM}rem + ${TOTAL_UNITS * UNIT_SVH}svh)` }}
      >
        <div
          ref={pinnedRef}
          className="sticky flex items-center"
          style={{ top: `${PIN_TOP_REM}rem`, height: `calc(100svh - ${PIN_TOP_REM}rem)` }}
        >
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="hidden lg:block">
              <StageScene active={active} />
            </div>
            {steps}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A cover slide behind, the selected stage on a card in front, and a floating step pill. */
function StageScene({ active }: { active: number }) {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[23rem] w-full max-w-xl sm:h-[27rem]">
      <div className="pointer-events-none absolute -inset-6">
        <div className="absolute top-[10%] left-[5%] size-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[5%] bottom-[5%] size-64 rounded-full bg-highlight/15 blur-3xl" />
      </div>

      {/* Back: the sample deck's cover slide */}
      <div
        className={cn(
          "absolute top-0 left-0 flex h-[84%] w-[82%] flex-col overflow-hidden rounded-3xl bg-card/70 p-5 shadow-xl ring-1 shadow-primary/5 ring-foreground/5 backdrop-blur-xl transition-[translate]",
          EASE,
          "sm:p-7 dark:bg-card/50 dark:ring-foreground/10",
        )}
        style={{ translate: `${active * -6}px 0` }}
      >
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <LogoMark className="size-5" />
          <span className="truncate">{SAMPLE_DECK.deckTitle}</span>
        </span>
        <p className="mt-5 max-w-[16rem] font-heading text-xl leading-tight font-semibold tracking-tight text-balance sm:text-2xl">
          {SAMPLE_DECK.slides[0].title}
        </p>
        <div className="mt-auto h-[38%] w-[46%] rounded-xl bg-linear-to-br from-primary/80 via-primary/50 to-highlight/70" />
      </div>

      {/* Front: the selected stage */}
      <div className="absolute right-0 bottom-0 h-[64%] w-[64%]">
        <div className="relative h-full overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl ring-1 shadow-foreground/10 ring-foreground/10">
          <Stage visible={active === 0}>
            <IdeaStage />
          </Stage>
          <Stage visible={active === 1}>
            <DraftStage />
          </Stage>
          <Stage visible={active === 2}>
            <ReadyStage />
          </Stage>
        </div>

        <div className="absolute -top-5 left-4 rounded-full bg-linear-to-r from-primary via-highlight to-primary p-px shadow-lg shadow-primary/20">
          <span className="flex items-center gap-2 rounded-full bg-card/95 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-xl sm:text-sm">
            <span key={active} className="animate-rise [animation-duration:600ms]">
              Step {active + 1} of {STEPS.length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Stage({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col p-4 pt-7 transition-[opacity,translate,scale,filter] sm:p-5 sm:pt-8",
        EASE,
        visible
          ? "opacity-100"
          : "pointer-events-none translate-y-3 scale-[0.98] opacity-0 blur-sm",
      )}
    >
      {children}
    </div>
  );
}

function IdeaStage() {
  return (
    <>
      <span className="text-xs font-semibold">Your idea</span>
      {/* The clamp sits on the inner span, so a clipped line can't show through the padding. */}
      <p className="mt-2 rounded-lg bg-background p-2.5 text-[0.7rem] leading-relaxed text-muted-foreground ring-1 ring-foreground/10 sm:text-xs">
        <span className="line-clamp-4 sm:line-clamp-5">{SAMPLE_DECK.idea}</span>
      </p>
      <span className="mt-auto flex items-center justify-between gap-2">
        <span className="font-mono text-[0.65rem] text-muted-foreground tabular-nums">
          {SAMPLE_DECK.idea.length}/2,000
        </span>
        <span className="flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[0.7rem] font-semibold text-background sm:text-xs">
          Generate
          <ArrowRightIcon className="size-3" />
        </span>
      </span>
    </>
  );
}

function DraftStage() {
  const slides = SAMPLE_DECK.slides.slice(0, 5);
  const current = 3;
  return (
    <>
      <span className="flex items-center justify-between text-xs font-semibold">
        Drafting slides
        <span className="flex items-center gap-0.5">
          <span className="size-1 animate-typing rounded-full bg-primary" />
          <span className="size-1 animate-typing rounded-full bg-primary [animation-delay:150ms]" />
          <span className="size-1 animate-typing rounded-full bg-primary [animation-delay:300ms]" />
        </span>
      </span>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {slides.map((slide, index) => (
          <li key={slide.title} className="flex items-center gap-2 text-[0.7rem] sm:text-xs">
            {index < current ? (
              <CheckTickCircleIcon className="size-3.5 shrink-0 text-primary" />
            ) : (
              <span
                className={cn(
                  "mx-px size-3 shrink-0 rounded-full",
                  index === current ? "animate-pulse bg-highlight" : "ring-1 ring-foreground/20",
                )}
              />
            )}
            <span
              className={cn(
                "truncate",
                index > current ? "text-muted-foreground/60" : "text-foreground/85",
              )}
            >
              {slide.title}
            </span>
          </li>
        ))}
      </ul>
      <span className="mt-auto h-1.5 overflow-hidden rounded-full bg-muted">
        <span className="block h-full w-3/5 rounded-full bg-linear-to-r from-primary to-highlight" />
      </span>
    </>
  );
}

function ReadyStage() {
  const tones = [
    "from-primary to-primary/60",
    "from-highlight to-primary/70",
    "from-primary/70 to-highlight",
    "from-primary/60 to-primary",
    "from-highlight/80 to-highlight/40",
    "from-primary to-highlight/70",
  ];
  return (
    <>
      <span className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <ShieldCheckIcon className="size-4 text-primary" />
          Reviewed
        </span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-medium text-secondary-foreground">
          {SAMPLE_DECK.slides.length} slides
        </span>
      </span>
      <span className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
        {tones.map((tone) => (
          <span
            key={tone}
            className="flex aspect-[16/11] flex-col gap-1 rounded-md bg-background p-1 ring-1 ring-foreground/10"
          >
            <span className={cn("flex-1 rounded-sm bg-linear-to-br", tone)} />
            <span className="h-0.5 w-3/4 rounded-full bg-foreground/25" />
          </span>
        ))}
      </span>
      <span className="mt-auto flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground sm:text-xs">
        <CheckTickCircleIcon className="size-3.5 text-primary" />
        Ready to share
      </span>
    </>
  );
}
