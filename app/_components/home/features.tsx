import { SAMPLE_DECK, SAMPLE_SLIDE_LABELS } from "@/app/_content/sample-deck";
import { Container } from "@/components/site/container";
import { cn } from "@/lib/utils";
import {
  CheckTickCircleIcon,
  ChevronDownIcon,
  LinkSlantIcon,
  PhotoImageIcon,
  RefreshIcon,
  ShieldCheckIcon,
} from "@/src/components/icons";

import { SectionHeading } from "./section-heading";

/** Each icon badge takes one of the brand tones: indigo, indigo into coral, or coral. */
const TONES = {
  indigo: { halo: "bg-primary/8 ring-primary/15", fill: "from-primary to-primary/70" },
  blend: { halo: "bg-primary/8 ring-primary/15", fill: "from-primary to-highlight" },
  coral: { halo: "bg-highlight/10 ring-highlight/20", fill: "from-highlight to-highlight/75" },
};

const HIGHLIGHTS = [
  {
    icon: PhotoImageIcon,
    tone: TONES.indigo,
    title: "An image for every slide",
    text: "Each slide gets its own picture of a concrete scene, with no text or charts baked into it.",
  },
  {
    icon: RefreshIcon,
    tone: TONES.blend,
    title: "Live progress",
    text: "Your deck's page follows generation from queued to ready, without a reload.",
  },
  {
    icon: LinkSlantIcon,
    tone: TONES.coral,
    title: "A link for every deck",
    text: "Every deck has its own address you can open again later or send to a co-founder.",
  },
];

/** Criteria from the reviewer's rubric (src/ai/pitch-deck/evaluator-agent.ts). */
const RUBRIC = [
  "Faithful to the idea",
  "Clear problem and solution",
  "Credible market and model",
  "Specific, not generic",
];

const STORY = SAMPLE_SLIDE_LABELS;
const STORY_ACTIVE = 3;

const number = (n: number) => String(n).padStart(2, "0");

/**
 * Three icon cards over two wide showcase cards. The showcases hold small product mockups built
 * from tokens that bleed off the bottom edge and rise a little on hover. Mockups are decorative
 * (`aria-hidden`); every claim lives in the card's heading and text.
 */
export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="border-t border-border bg-muted/50 py-20 sm:py-28"
    >
      <Container className="flex flex-col gap-12 sm:gap-14">
        <SectionHeading
          id="features-title"
          label="Features"
          title="Built to produce decks worth sending"
          description="Every deck goes through the same structure, review and illustration steps, so the result is consistent, not lucky."
        />

        <div className="flex flex-col gap-4 sm:gap-5">
          <ul className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <HighlightCard key={item.title} {...item} />
            ))}
          </ul>

          <ul className="grid gap-4 sm:gap-5 lg:grid-cols-5">
            <ShowcaseCard
              title="Independent quality review"
              text="A separate reviewer grades every deck against your idea and blocks weak ones before you see them."
              className="lg:col-span-2"
            >
              <ReviewMockup />
            </ShowcaseCard>
            <ShowcaseCard
              title="An investor story, not a template"
              text="Slides follow the order investors expect, and each one moves the story forward. Thin ideas get fewer, stronger slides."
              className="lg:col-span-3"
            >
              <StoryMockup />
            </ShowcaseCard>
          </ul>
        </div>
      </Container>
    </section>
  );
}

function HighlightCard({ icon: Icon, tone, title, text }: (typeof HIGHLIGHTS)[number]) {
  return (
    <li className="flex flex-col gap-6 rounded-3xl bg-card p-6 text-card-foreground shadow-sm ring-1 shadow-primary/5 ring-foreground/8 transition-[translate,box-shadow] duration-500 ease-apple hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 sm:p-7 dark:ring-foreground/10">
      {/* A soft halo around a gradient tile, like the selected step in How it works. */}
      <span
        aria-hidden="true"
        className={cn(
          "flex size-14 items-center justify-center rounded-[1.25rem] ring-1",
          tone.halo,
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-linear-to-br text-primary-foreground shadow-md shadow-primary/20",
            tone.fill,
          )}
        >
          <Icon className="size-5" />
        </span>
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="leading-relaxed text-pretty text-muted-foreground">{text}</p>
      </div>
    </li>
  );
}

function ShowcaseCard({
  title,
  text,
  className,
  children,
}: {
  title: string;
  text: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "group/showcase relative flex flex-col overflow-hidden rounded-3xl bg-secondary/60 text-card-foreground ring-1 ring-primary/10 dark:bg-secondary/40 dark:ring-foreground/10",
        className,
      )}
    >
      <div className="flex flex-col gap-2 p-6 pb-0 sm:p-8 sm:pb-0">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="max-w-lg leading-relaxed text-pretty text-muted-foreground">{text}</p>
      </div>

      {/* A fixed window at the card's foot, the same height in both cards, so the mockups line up
          and the card's bottom edge crops them. */}
      <div aria-hidden="true" className="relative mt-auto px-5 pt-8 sm:px-10 sm:pt-10">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5">
          <div className="absolute -bottom-1/4 left-[5%] h-3/4 w-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-[5%] -bottom-1/4 h-3/4 w-1/2 rounded-full bg-highlight/15 blur-3xl" />
        </div>
        <div className="relative h-72 sm:h-80">
          <div className="transition-transform duration-700 ease-apple group-hover/showcase:-translate-y-2">
            {children}
          </div>
        </div>
      </div>
    </li>
  );
}

function MockupPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        // Taller than the window, so the panel's bottom edge stays hidden even while hovered.
        "min-h-80 rounded-t-2xl bg-card p-4 shadow-2xl ring-1 shadow-primary/15 ring-foreground/10 sm:min-h-88 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The reviewer's verdict on the sample deck, with four rubric criteria passed. */
function ReviewMockup() {
  return (
    <MockupPanel className="mx-auto max-w-sm">
      <div className="flex items-center gap-3">
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{SAMPLE_DECK.deckTitle}</span>
          <span className="text-xs text-muted-foreground">Independent reviewer</span>
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 rounded-xl bg-background p-4 ring-1 ring-foreground/8 dark:ring-foreground/10">
        <span className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Verdict</span>
          <span className="text-2xl font-semibold tracking-tight">Approved</span>
          <span className="text-xs text-muted-foreground">Checked against your idea</span>
        </span>
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <ShieldCheckIcon className="size-3.5" />
          Ready
        </span>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2">
        {RUBRIC.map((item) => (
          <li
            key={item}
            className="flex flex-col gap-2 rounded-xl p-3 text-xs leading-snug font-medium ring-1 ring-foreground/8 dark:ring-foreground/10"
          >
            <CheckTickCircleIcon className="size-4 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </MockupPanel>
  );
}

/** The sample deck's seven slides on a timeline, the current one called out above its guide. */
function StoryMockup() {
  const active = SAMPLE_DECK.slides[STORY_ACTIVE];
  // Column centres sit at (i + 0.5) / 7, so the track runs from the first to the last centre.
  const columns = STORY.length;
  const inset = `${50 / columns}%`;

  return (
    <MockupPanel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Story order
            <ChevronDownIcon className="size-3.5" />
          </span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {columns} slides
          </span>
        </span>
        <span className="flex rounded-lg bg-muted p-0.5 text-xs font-medium tabular-nums">
          {[5, 6, 7, 8].map((count) => (
            <span
              key={count}
              className={cn(
                "rounded-md px-2.5 py-1",
                count === columns
                  ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/8"
                  : "text-muted-foreground",
              )}
            >
              {count}
            </span>
          ))}
        </span>
      </div>

      <div className="relative mt-5">
        {/* Dashed vertical guides, one per slide; the current one is tinted. */}
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {STORY.map((label, index) => (
            <span
              key={label}
              className={cn(
                "mx-auto w-0 border-l border-dashed",
                index === STORY_ACTIVE ? "border-primary/60" : "border-border",
              )}
            />
          ))}
        </div>

        {/* Callout for the current slide */}
        <div className="relative flex justify-center">
          <span className="flex max-w-full min-w-0 flex-col rounded-xl bg-card px-3 py-2 shadow-lg ring-1 shadow-primary/10 ring-foreground/10">
            <span className="font-mono text-[0.65rem] text-muted-foreground tabular-nums">
              {number(STORY_ACTIVE + 1)} · {STORY[STORY_ACTIVE]}
            </span>
            <span className="truncate text-xs font-semibold">{active.title}</span>
          </span>
        </div>

        {/* Slide thumbnails */}
        <ol
          className="relative mt-4 grid gap-1.5 sm:gap-2.5"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {STORY.map((label, index) => (
            <li
              key={label}
              className={cn(
                "flex aspect-[4/3] flex-col gap-1 rounded-md bg-card p-1 ring-1 ring-foreground/10 sm:p-1.5",
                index === STORY_ACTIVE &&
                  "-translate-y-1 shadow-md ring-2 shadow-primary/20 ring-primary",
              )}
            >
              <span
                className={cn(
                  "flex-1 rounded-sm bg-linear-to-br",
                  index <= STORY_ACTIVE
                    ? "from-primary/80 to-highlight/70"
                    : "from-muted-foreground/25 to-muted-foreground/10",
                )}
              />
              <span className="h-0.5 w-3/4 rounded-full bg-foreground/20" />
            </li>
          ))}
        </ol>

        {/* Track with progress up to the current slide */}
        <div className="relative mt-4 h-3">
          <span
            className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border"
            style={{ left: inset, right: inset }}
          />
          <span
            className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-linear-to-r from-primary to-highlight"
            style={{ left: inset, width: `${(STORY_ACTIVE / columns) * 100}%` }}
          />
          <div
            className="relative grid h-full"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {STORY.map((label, index) => (
              <span key={label} className="flex items-center justify-center">
                <span
                  className={cn(
                    "rounded-full",
                    index === STORY_ACTIVE
                      ? "size-3 bg-primary ring-4 ring-primary/20"
                      : index < STORY_ACTIVE
                        ? "size-2 bg-primary"
                        : "size-2 bg-card ring-1 ring-foreground/25",
                  )}
                />
              </span>
            ))}
          </div>
        </div>

        {/* Labels; narrow screens show slide numbers instead. */}
        <div
          className="relative mt-3 grid text-center text-[0.7rem]"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {STORY.map((label, index) => (
            <span
              key={label}
              className={cn(
                "truncate px-0.5",
                index === STORY_ACTIVE ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="font-mono tabular-nums sm:hidden">{number(index + 1)}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </MockupPanel>
  );
}
