import { Badge } from "@/components/ui/badge";
import type { DeckStatus } from "@/src/decks/polling";

const BADGES: Record<
  DeckStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Queued", variant: "secondary" },
  GENERATING: { label: "Generating", variant: "default" },
  COMPLETE: { label: "Ready", variant: "outline" },
  FAILED: { label: "Failed", variant: "destructive" },
};

/** A deck's generation status, worded the same on the deck page and in the deck list. */
export function DeckStatusBadge({ status, className }: { status: DeckStatus; className?: string }) {
  return (
    <Badge variant={BADGES[status].variant} className={className}>
      {BADGES[status].label}
    </Badge>
  );
}
