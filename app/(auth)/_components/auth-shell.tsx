import { SAMPLE_DECK } from "@/app/_content/sample-deck";
import { Container } from "@/components/site/container";
import {
  CheckTickCircleIcon,
  LayerThreeIcon,
  PhotoImageIcon,
  ShieldCheckIcon,
} from "@/src/components/icons";

// Only claims the product backs today (see app/_components/home/facts.tsx).
const POINTS = [
  { icon: LayerThreeIcon, text: "5 to 8 slides, from the problem to the ask" },
  { icon: ShieldCheckIcon, text: "Checked by an independent reviewer" },
  { icon: PhotoImageIcon, text: "An image generated for every slide" },
];

/**
 * The shared frame of the sign-in and sign-up pages, in the home page's style: the hero's indigo
 * and coral wash, the form on a frosted card, and (on wide screens) a brand panel with what an
 * account gets you and a preview of a finished deck. Built from tokens only.
 */
export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center">
      {/* The wash reaches up behind the see-through header, as on the home page. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-32 bottom-0">
        <div className="absolute top-0 left-[6%] size-[26rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[4%] bottom-0 size-[30rem] rounded-full bg-highlight/12 blur-3xl" />
      </div>

      <Container className="relative grid gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="flex animate-rise flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {title}
              </h1>
              <p className="text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="animate-rise rounded-3xl bg-card/80 p-6 text-card-foreground shadow-xl ring-1 shadow-primary/10 ring-foreground/8 backdrop-blur-xl [animation-delay:80ms] sm:p-8 dark:bg-card/60 dark:ring-foreground/10">
            {children}
          </div>

          <p className="animate-rise text-center text-base text-muted-foreground [animation-delay:160ms] lg:text-left">
            {footer}
          </p>
        </div>

        <AuthAside />
      </Container>
    </div>
  );
}

/** The brand panel: what you get, and a finished deck's cover with a "ready" status. */
function AuthAside() {
  const slide = SAMPLE_DECK.slides[0];

  return (
    <aside
      aria-label="What you get"
      className="relative hidden animate-settle overflow-hidden rounded-3xl bg-secondary/60 p-10 ring-1 ring-primary/10 [animation-delay:200ms] lg:flex lg:flex-col lg:gap-8 dark:bg-secondary/40 dark:ring-foreground/10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-10 h-64 w-2/3 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-10 -bottom-16 h-64 w-2/3 rounded-full bg-highlight/15 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-3">
        <p className="text-sm font-semibold text-primary">AI Pitch Deck</p>
        <p className="font-heading text-2xl leading-tight font-semibold tracking-tight text-balance xl:text-3xl">
          One idea in. An{" "}
          <span className="bg-linear-to-r from-primary to-highlight bg-clip-text whitespace-nowrap text-transparent">
            investor-ready
          </span>{" "}
          deck out.
        </p>
      </div>

      <ul className="relative flex flex-col gap-3">
        {POINTS.map((point) => (
          <li key={point.text} className="flex items-center gap-3 text-sm font-medium">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm ring-1 ring-foreground/8">
              <point.icon aria-hidden="true" className="size-[18px]" />
            </span>
            {point.text}
          </li>
        ))}
      </ul>

      {/* A finished deck's cover, as on the home page. Decorative. */}
      <div aria-hidden="true" className="relative pb-5">
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 rounded-2xl bg-card p-5 shadow-2xl ring-1 shadow-primary/15 ring-foreground/10">
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="truncate">{SAMPLE_DECK.deckTitle}</span>
            </span>
            <p className="mt-6 font-heading text-lg leading-tight font-semibold tracking-tight text-balance">
              {slide.title}
            </p>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {slide.content}
            </p>
          </div>
          <div className="relative min-h-32 overflow-hidden rounded-xl bg-linear-to-br from-primary via-primary/70 to-highlight">
            <span className="absolute -top-6 -right-6 size-24 rounded-full bg-primary-foreground/20" />
            <span className="absolute -bottom-8 -left-4 size-28 rounded-full bg-highlight/70 blur-md" />
            <span className="absolute right-3 bottom-3 left-3 flex h-1/2 items-end gap-1.5">
              {[45, 70, 55, 90].map((height) => (
                <span
                  key={height}
                  className="flex-1 rounded-sm bg-primary-foreground/70"
                  style={{ height: `${height}%` }}
                />
              ))}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-5 rounded-full bg-linear-to-r from-primary via-highlight to-primary p-px shadow-xl shadow-primary/20">
          <span className="flex items-center gap-2 rounded-full bg-card/95 px-4 py-1.5 text-sm font-medium backdrop-blur-xl">
            <CheckTickCircleIcon className="size-4 text-primary" />
            Deck ready · {SAMPLE_DECK.slides.length} slides
          </span>
        </div>
      </div>
    </aside>
  );
}
