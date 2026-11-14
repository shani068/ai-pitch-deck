"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BulbOnIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MultipleCrossCancelIcon,
  PhotoImageIcon,
  PlayCircleIcon,
} from "@/src/components/icons";

export type PresenterSlide = {
  title: string;
  content: string;
  imagePrompt: string;
  /** Already checked against the allowed image hosts on the server; `null` shows the fallback. */
  imageUrl: string | null;
  /** True when the image is the whole drawn slide; false for a placeholder photo. */
  imageIsSlide: boolean;
};

type Accent = { border: string; chip: string; marker: string; tint: string };

// Slides cycle through the deck accents (mint, pink, coral, amber, slate). Full class names are
// spelled out so Tailwind can find them.
const ACCENTS: readonly Accent[] = [
  {
    border: "border-deck-1",
    chip: "bg-deck-1",
    marker: "from-deck-1/45",
    tint: "from-deck-1/50 to-deck-1/10",
  },
  {
    border: "border-deck-2",
    chip: "bg-deck-2",
    marker: "from-deck-2/45",
    tint: "from-deck-2/50 to-deck-2/10",
  },
  {
    border: "border-deck-3",
    chip: "bg-deck-3",
    marker: "from-deck-3/45",
    tint: "from-deck-3/50 to-deck-3/10",
  },
  {
    border: "border-deck-4",
    chip: "bg-deck-4",
    marker: "from-deck-4/45",
    tint: "from-deck-4/50 to-deck-4/10",
  },
  {
    border: "border-deck-5",
    chip: "bg-deck-5",
    marker: "from-deck-5/45",
    tint: "from-deck-5/50 to-deck-5/10",
  },
];

const accentFor = (index: number) => ACCENTS[index % ACCENTS.length];
/** The spotlight's radius as a share of the slide's width. */
const SPOTLIGHT_RADIUS = 0.16;
const pad = (n: number) => String(n).padStart(2, "0");

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
}

function subscribeToFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

const subscribeToNothing = () => () => {};

/**
 * The finished deck as a presentation: one slide at a time on a scroll-snap track (so touch
 * swiping is native), arrow keys and buttons to move, a full-screen "Present" mode, the slide's
 * full text as notes, and a vertical, colour-coded slide list to jump to any slide.
 */
export function DeckPresenter({
  deckTitle,
  slides,
}: {
  deckTitle: string;
  slides: PresenterSlide[];
}) {
  const frameRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const last = slides.length - 1;
  const current = slides[active];

  // Element full screen is missing on some browsers (iPhone Safari); the button is hidden there.
  const canPresent = useSyncExternalStore(
    subscribeToNothing,
    () => document.fullscreenEnabled,
    () => false,
  );
  const presenting = useSyncExternalStore(
    subscribeToFullscreen,
    () => document.fullscreenElement !== null && document.fullscreenElement === frameRef.current,
    () => false,
  );

  // Spotlight exists only while presenting, and is off again the next time presenting starts
  // (also when full screen was left with Esc, which never reaches our button).
  const stageRef = useRef<HTMLDivElement>(null);
  const [spotlightOn, setSpotlightOn] = useState(false);
  const [wasPresenting, setWasPresenting] = useState(presenting);
  if (presenting !== wasPresenting) {
    setWasPresenting(presenting);
    if (!presenting) setSpotlightOn(false);
  }
  const spotlight = presenting && spotlightOn;

  const goTo = useCallback(
    (index: number, behavior: ScrollBehavior = scrollBehavior()) => {
      const track = trackRef.current;
      if (!track) return;
      const target = Math.min(last, Math.max(0, index));
      track.scrollTo({ left: target * track.clientWidth, behavior });
    },
    [last],
  );

  // The active slide follows the track's scroll position, whether it moved by swipe, wheel,
  // keyboard or a button.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      if (track.clientWidth === 0) return;
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setActive(Math.min(last, Math.max(0, index)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [last]);

  // Keep the active slide centred in the sidebar list without scrolling the page. Below `lg` the
  // list is not a scroll container, so this does nothing there.
  useEffect(() => {
    const list = thumbsRef.current;
    const thumb = list?.children[active];
    if (!list || !(thumb instanceof HTMLElement)) return;
    list.scrollTo({
      top: thumb.offsetTop - (list.clientHeight - thumb.offsetHeight) / 2,
      behavior: scrollBehavior(),
    });
  }, [active, presenting]);

  // The spotlight follows the pointer over the slide. Its position lives in CSS variables, so
  // moving it never re-renders React. It starts in the centre of the slide.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !spotlight) return;
    const place = (clientX: number, clientY: number) => {
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty("--spot-x", `${clientX - rect.left}px`);
      stage.style.setProperty("--spot-y", `${clientY - rect.top}px`);
      stage.style.setProperty("--spot-r", `${Math.round(rect.width * SPOTLIGHT_RADIUS)}px`);
    };
    const rect = stage.getBoundingClientRect();
    place(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const onPointerMove = (event: PointerEvent) => place(event.clientX, event.clientY);
    stage.addEventListener("pointermove", onPointerMove);
    return () => stage.removeEventListener("pointermove", onPointerMove);
  }, [spotlight]);

  // Arrow keys, Page Up/Down, Home and End move between slides while focus is inside the deck;
  // while presenting, S turns the spotlight on and off.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (presenting && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setSpotlightOn((on) => !on);
        return;
      }
      const targets: Partial<Record<string, number>> = {
        ArrowLeft: active - 1,
        PageUp: active - 1,
        ArrowRight: active + 1,
        PageDown: active + 1,
        Home: 0,
        End: last,
      };
      const target = targets[event.key];
      if (target === undefined) return;
      event.preventDefault();
      goTo(target);
    };
    frame.addEventListener("keydown", onKeyDown);
    return () => frame.removeEventListener("keydown", onKeyDown);
  }, [active, last, goTo, presenting]);

  async function togglePresenting() {
    const frame = frameRef.current;
    if (!frame) return;
    const index = active;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frame.requestFullscreen();
    } catch {
      return; // The browser refused; the deck simply stays inline.
    }
    // The track's width changed, so land exactly on the slide that was showing.
    requestAnimationFrame(() => goTo(index, "instant"));
  }

  return (
    <section
      ref={frameRef}
      aria-roledescription="carousel"
      aria-label={`${deckTitle} slides`}
      className={cn(
        "flex flex-col bg-background",
        presenting && "justify-center overflow-y-auto p-4 sm:p-8",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-4",
          presenting && "max-w-[calc((100dvh-8rem)*3/2)]",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-3 text-sm">
            <span className="font-mono font-semibold tabular-nums">
              {pad(active + 1)}
              <span className="text-muted-foreground"> / {pad(slides.length)}</span>
            </span>
            <span className="hidden truncate text-muted-foreground sm:inline">{current.title}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {/* aria-disabled instead of disabled, so a focused button keeps focus at either end. */}
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Previous slide"
              aria-disabled={active === 0}
              onClick={() => goTo(active - 1)}
              className="aria-disabled:cursor-default aria-disabled:opacity-50"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Next slide"
              aria-disabled={active === last}
              onClick={() => goTo(active + 1)}
              className="aria-disabled:cursor-default aria-disabled:opacity-50"
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
            {presenting ? (
              <Button
                size="lg"
                variant={spotlightOn ? "default" : "outline"}
                aria-pressed={spotlightOn}
                aria-keyshortcuts="S"
                title="Spotlight (S)"
                onClick={() => setSpotlightOn((on) => !on)}
              >
                <BulbOnIcon aria-hidden="true" data-icon="inline-start" />
                Spotlight
              </Button>
            ) : null}
            {canPresent ? (
              <Button
                size="lg"
                variant={presenting ? "outline" : "default"}
                onClick={togglePresenting}
              >
                {presenting ? (
                  <MultipleCrossCancelIcon aria-hidden="true" data-icon="inline-start" />
                ) : (
                  <PlayCircleIcon aria-hidden="true" data-icon="inline-start" />
                )}
                {presenting ? "Exit" : "Present"}
              </Button>
            ) : null}
          </div>
        </div>

        <p aria-live="polite" aria-atomic="true" className="sr-only">
          Slide {active + 1} of {slides.length}: {current.title}
        </p>

        {/* Large screens: the slide list is a sidebar beside the slide, as in a slide editor.
            Smaller screens: the same list follows the slide, one row per slide. */}
        <div className={cn("grid gap-4", !presenting && "lg:grid-cols-[16rem_minmax(0,1fr)]")}>
          <div className="flex min-w-0 flex-col gap-4">
            <div ref={stageRef} className={cn("relative", spotlight && "cursor-none")}>
              <div
                ref={trackRef}
                className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {slides.map((slide, index) => (
                  <div key={index} className="w-full shrink-0 snap-start snap-always">
                    <SlideFrame
                      slide={slide}
                      index={index}
                      total={slides.length}
                      deckTitle={deckTitle}
                    />
                  </div>
                ))}
              </div>

              {/* Dims the slide except a soft circle around the pointer. It ignores the pointer,
                  so swiping and clicking still reach the slide underneath. `--scrim` is a plain
                  variable from globals.css: an `@theme` colour that no utility uses is never
                  emitted, so `--color-scrim` would be undefined and the gradient invalid. */}
              {spotlight ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(circle var(--spot-r, 160px) at var(--spot-x, 50%) var(--spot-y, 50%), transparent 0 78%, var(--scrim) 100%)",
                  }}
                />
              ) : null}
            </div>

            {presenting ? null : (
              <details className="group rounded-xl border bg-card text-card-foreground">
                <summary className="flex list-none items-center gap-2 px-4 py-3 text-sm font-medium outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="size-4 text-highlight transition-transform duration-300 ease-apple group-open:rotate-90"
                  />
                  Notes
                </summary>
                <div className="flex flex-col gap-1 px-4 pb-4 pl-10">
                  <p className="font-medium">{current.title}</p>
                  <p className="leading-relaxed text-pretty text-muted-foreground">
                    {current.content}
                  </p>
                </div>
              </details>
            )}
          </div>

          {presenting ? null : (
            // On large screens the list is absolutely positioned, so the slide column alone sets
            // the row's height and the list scrolls within it.
            <div className="relative lg:order-first">
              <ol
                ref={thumbsRef}
                aria-label="All slides"
                className="relative flex flex-col gap-1.5 lg:absolute lg:inset-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-1"
              >
                {slides.map((slide, index) => {
                  const isActive = index === active;
                  const accent = accentFor(index);
                  return (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => goTo(index)}
                        aria-current={isActive ? "true" : undefined}
                        aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl p-1.5 pr-3 text-left transition-colors duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "w-5 shrink-0 text-center font-mono text-xs tabular-nums",
                            isActive ? "font-semibold" : "text-muted-foreground",
                          )}
                        >
                          {pad(index + 1)}
                        </span>
                        <span
                          className={cn(
                            "relative block aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-md border-2 bg-muted transition-shadow duration-200 sm:w-28",
                            accent.border,
                            isActive && "shadow-md",
                          )}
                        >
                          <SlideVisual src={slide.imageUrl} alt="" sizes="112px" accent={accent} />
                        </span>
                        <span
                          className={cn(
                            "line-clamp-2 min-w-0 text-sm leading-snug",
                            isActive ? "font-semibold" : "font-medium text-muted-foreground",
                          )}
                        >
                          {slide.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SlideFrame({
  slide,
  index,
  total,
  deckTitle,
}: {
  slide: PresenterSlide;
  index: number;
  total: number;
  deckTitle: string;
}) {
  const accent = accentFor(index);
  const label = `${index + 1} of ${total}: ${slide.title}`;
  const [slideImageFailed, setSlideImageFailed] = useState(false);

  // A generated slide image already holds the title, key message and illustration, so it is the
  // whole slide. If it fails to load, the text layout below shows the same slide instead.
  if (slide.imageUrl && slide.imageIsSlide && !slideImageFailed) {
    return (
      <article
        aria-roledescription="slide"
        aria-label={label}
        className="relative aspect-[3/2] h-full overflow-hidden rounded-2xl border bg-muted"
      >
        <Image
          src={slide.imageUrl}
          alt={`${slide.title}. Illustration: ${slide.imagePrompt}`}
          fill
          sizes="(min-width: 1280px) 1280px, 100vw"
          preload={index === 0}
          onError={() => setSlideImageFailed(true)}
          className="object-cover"
        />
      </article>
    );
  }

  // No overflow-hidden here: with it, the aspect ratio could clip a long slide instead of growing.
  return (
    <article
      aria-roledescription="slide"
      aria-label={label}
      className="@container grid h-full rounded-2xl border bg-card text-card-foreground lg:aspect-[3/2] lg:grid-cols-2"
    >
      <div className="relative order-last flex flex-col gap-6 p-6 sm:p-8 lg:order-first lg:p-10">
        {/* A faint grid, fading out from the corner: the deck's "whiteboard". */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[2rem_2rem] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]"
        />
        <div className="relative flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-xs font-semibold text-foreground tabular-nums",
              accent.chip,
            )}
          >
            {pad(index + 1)}
          </span>
          <span className="truncate text-xs font-medium text-muted-foreground">{deckTitle}</span>
        </div>
        <div className="relative flex flex-1 flex-col justify-center gap-4">
          <h2 className="text-2xl leading-tight font-semibold tracking-tight text-balance @3xl:text-3xl @6xl:text-5xl">
            {/* A highlighter stroke under the title, like a marker on a whiteboard. */}
            <span
              className={cn(
                "box-decoration-clone bg-linear-to-t from-35% to-transparent to-35%",
                accent.marker,
              )}
            >
              {slide.title}
            </span>
          </h2>
          <p className="leading-relaxed text-pretty text-muted-foreground @6xl:text-xl">
            {slide.content}
          </p>
        </div>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-muted lg:aspect-auto lg:rounded-t-none lg:rounded-r-2xl">
        <SlideVisual
          src={slide.imageUrl}
          alt={slide.imagePrompt}
          sizes="(min-width: 1024px) 50vw, 100vw"
          accent={accent}
          preload={index === 0}
        />
      </div>
    </article>
  );
}

/**
 * The slide image, or an accent-tinted panel when there is none or it fails to load (for example
 * when the placeholder image service is down), so a broken image or its alt text never shows.
 */
function SlideVisual({
  src,
  alt,
  sizes,
  accent,
  preload = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  accent: Accent;
  preload?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-linear-to-br text-foreground/35",
          accent.tint,
        )}
      >
        <PhotoImageIcon aria-hidden="true" className="h-auto w-1/6 max-w-14 min-w-6" />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      onError={() => setFailedSrc(src)}
      className="object-cover"
    />
  );
}
