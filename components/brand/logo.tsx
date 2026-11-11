import { cn } from "@/lib/utils";

// The brand mark: three slides rising up and to the right (a deck, and growth), with a coral
// "spark" on the front slide. This is the project's only hand-authored SVG; every icon comes from
// Pikaicons. app/icon.svg is the same mark with fixed colours for the browser tab.

/** The mark alone. Decorative: pair it with visible text or an accessible name. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn("size-8 shrink-0", className)}
    >
      <rect x="2" y="14" width="17" height="14" rx="3.5" className="fill-muted-foreground/35" />
      <rect x="7.5" y="9" width="17" height="14" rx="3.5" className="fill-primary/55" />
      <rect x="13" y="4" width="17" height="14" rx="3.5" className="fill-primary" />
      <rect x="16.5" y="8" width="6.5" height="2" rx="1" className="fill-primary-foreground" />
      <rect x="16.5" y="12" width="9.5" height="2" rx="1" className="fill-primary-foreground/60" />
      <rect x="24.5" y="7" width="3" height="3" rx="0.75" className="fill-highlight" />
    </svg>
  );
}

/** Mark plus the "AI Pitch Deck" wordmark, set as live text so it themes and scales. */
export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="font-heading text-lg leading-none font-semibold tracking-tight">
        <span className="text-primary">AI</span> Pitch Deck
      </span>
    </span>
  );
}
