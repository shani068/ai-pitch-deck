"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
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
 * full text as notes, and a colour-coded thumbnail strip to jump to any slide.
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

  // Keep the active thumbnail centred in the strip without scrolling the page.
  useEffect(() => {
    const list = thumbsRef.current;
    const thumb = list?.children[active];
    if (!list || !(thumb instanceof HTMLElement)) return;
    list.scrollTo({
      left: thumb.offsetLeft - (list.clientWidth - thumb.offsetWidth) / 2,
      behavior: scrollBehavior(),
    });
  }, [active, presenting]);

  // Arrow keys, Page Up/Down, Home and End move between slides while focus is inside the deck.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
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
  }, [active, last, goTo]);

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

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full shrink-0 snap-start snap-always">
              <SlideFrame slide={slide} index={index} total={slides.length} deckTitle={deckTitle} />
            </div>
          ))}
        </div>

        <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-highlight transition-[width] duration-500 ease-apple"
            style={{ width: `${((active + 1) / slides.length) * 100}%` }}
          />
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
              <p className="leading-relaxed text-pretty text-muted-foreground">{current.content}</p>
            </div>
          </details>
        )}

        {presenting ? null : (
          <ol
            ref={thumbsRef}
            aria-label="All slides"
            className="relative flex gap-3 overflow-x-auto px-1 pt-1 pb-3"
          >
            {slides.map((slide, index) => {
              const isActive = index === active;
              return (
                <li key={index} className="w-36 shrink-0 sm:w-44">
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                    className={cn(
                      "flex w-full flex-col overflow-hidden rounded-xl border-2 bg-card text-left transition-[translate,opacity,box-shadow] duration-300 ease-apple outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      accentFor(index).border,
                      isActive
                        ? "-translate-y-0.5 shadow-md"
                        : "opacity-65 hover:-translate-y-0.5 hover:opacity-100",
                    )}
                  >
                    <span className="relative block aspect-[3/2] w-full bg-muted">
                      <SlideVisual
                        src={slide.imageUrl}
                        alt=""
                        sizes="176px"
                        accent={accentFor(index)}
                      />
                    </span>
                    <span className="flex items-start gap-2 p-2 text-xs">
                      <span className="font-mono text-muted-foreground tabular-nums">
                        {pad(index + 1)}
                      </span>
                      <span className="line-clamp-2 leading-snug font-medium">{slide.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
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
