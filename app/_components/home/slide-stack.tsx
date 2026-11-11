import { LogoMark } from "@/components/brand/logo";
import { SAMPLE_DECK } from "@/app/_content/sample-deck";

const PREVIEW_INDEX = 1;

/**
 * A typographic preview of a real sample slide, with two slides offset behind it like the logo
 * mark. Built from tokens only: no image, no remote request, no 3D transform.
 */
export function SlideStack() {
  const slide = SAMPLE_DECK.slides[PREVIEW_INDEX];
  const total = SAMPLE_DECK.slides.length;

  return (
    <figure className="relative mx-auto w-full max-w-xl pt-6 pr-6" aria-label="Example slide">
      {/* Two slides behind, rising up and to the right like the logo mark (offsets only). */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 bottom-6 left-6 rounded-2xl bg-muted ring-1 ring-foreground/10"
      />
      <div
        aria-hidden="true"
        className="absolute top-3 right-3 bottom-3 left-3 rounded-2xl bg-secondary ring-1 ring-foreground/10"
      />
      <div className="relative flex aspect-[16/11] flex-col rounded-2xl bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10 sm:p-8">
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-2">
            <LogoMark className="size-5" />
            <span className="truncate font-medium">{SAMPLE_DECK.deckTitle}</span>
          </span>
          <span className="shrink-0 font-mono tabular-nums">
            {String(PREVIEW_INDEX + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <p className="font-heading text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
            {slide.title}
          </p>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {slide.content}
          </p>
        </div>

        <div aria-hidden="true" className="mt-6 flex items-end gap-2">
          <span className="h-5 w-10 rounded-md bg-muted-foreground/25" />
          <span className="h-8 w-10 rounded-md bg-primary/55" />
          <span className="h-11 w-10 rounded-md bg-primary" />
          <span className="mb-8 size-2.5 rounded-sm bg-highlight" />
          <span className="ml-auto h-1.5 w-24 self-center rounded-full bg-muted" />
        </div>
      </div>
      <figcaption className="sr-only">
        Slide {PREVIEW_INDEX + 1} of the example deck &ldquo;{SAMPLE_DECK.deckTitle}&rdquo;.
      </figcaption>
    </figure>
  );
}
