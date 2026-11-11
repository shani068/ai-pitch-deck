import { Container } from "@/components/site/container";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  CheckTickCircleIcon,
  LayerThreeIcon,
  LinkSlantIcon,
  PhotoImageIcon,
  RefreshIcon,
  ShieldCheckIcon,
} from "@/src/components/icons";

import { SectionHeading } from "./section-heading";

const STORY = ["Problem", "Solution", "Market", "Business model", "Go-to-market", "The ask"];
const REVIEW_CHECKS = [
  "Faithful to your idea",
  "Specific, not generic",
  "Figures framed as targets",
];
const STATUSES = ["Queued", "Generating", "Ready"];

function Cell({
  icon: Icon,
  title,
  text,
  className,
  children,
}: {
  icon: typeof LayerThreeIcon;
  title: string;
  text: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex flex-col gap-6 rounded-2xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10 sm:p-7",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
      <div aria-hidden="true" className="mt-auto">
        {children}
      </div>
    </li>
  );
}

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="border-t border-border bg-muted/50 py-20 sm:py-24"
    >
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="features-title"
          label="Features"
          title="Built to produce decks worth sending"
          description="Every deck goes through the same structure, review and illustration steps, so the result is consistent, not lucky."
        />
        <ul className="grid gap-4 md:grid-cols-6">
          <Cell
            icon={LayerThreeIcon}
            title="An investor story, not a template"
            text="Slides follow the order investors expect, and each one moves the story forward. Thin ideas get fewer, stronger slides."
            className="md:col-span-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              {STORY.map((step, index) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium">
                    {step}
                  </span>
                  {index < STORY.length - 1 ? (
                    <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                  ) : null}
                </span>
              ))}
            </div>
          </Cell>

          <Cell
            icon={ShieldCheckIcon}
            title="Independent quality review"
            text="A separate reviewer grades every deck against your idea and blocks weak ones before you see them."
            className="md:col-span-2"
          >
            <ul className="flex flex-col gap-2 text-sm">
              {REVIEW_CHECKS.map((check) => (
                <li key={check} className="flex items-center gap-2">
                  <CheckTickCircleIcon className="size-4 shrink-0 text-primary" />
                  {check}
                </li>
              ))}
            </ul>
          </Cell>

          <Cell
            icon={PhotoImageIcon}
            title="An image for every slide"
            text="Each slide gets its own picture of a concrete scene, with no text or charts baked into it."
            className="md:col-span-2"
          >
            <div className="grid grid-cols-3 gap-2">
              <span className="aspect-square rounded-lg bg-secondary" />
              <span className="aspect-square rounded-lg bg-primary/55" />
              <span className="aspect-square rounded-lg bg-muted-foreground/20" />
            </div>
          </Cell>

          <Cell
            icon={RefreshIcon}
            title="Live progress"
            text="Your deck's page follows generation from queued to ready without a reload."
            className="md:col-span-2"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              {STATUSES.map((status, index) => (
                <span key={status} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1",
                      index === STATUSES.length - 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {status}
                  </span>
                  {index < STATUSES.length - 1 ? (
                    <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                  ) : null}
                </span>
              ))}
            </div>
          </Cell>

          <Cell
            icon={LinkSlantIcon}
            title="A link for every deck"
            text="Every deck has its own address you can open again later or send to a co-founder."
            className="md:col-span-2"
          >
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
              <LinkSlantIcon className="size-3.5 shrink-0" />
              <span className="truncate">/decks/tz4a98xxat96iws9zmbrgj3a</span>
            </div>
          </Cell>
        </ul>
      </Container>
    </section>
  );
}
