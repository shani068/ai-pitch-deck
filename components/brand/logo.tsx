import { cn } from "@/lib/utils";

// The brand is the wordmark alone, set as live text. There is no logo mark or favicon.

/** The "AI Pitch Deck" wordmark, set as live text so it themes and scales. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-heading text-lg leading-none font-semibold tracking-tight whitespace-nowrap",
        className,
      )}
    >
      <span className="text-primary">AI</span> Pitch Deck
    </span>
  );
}
