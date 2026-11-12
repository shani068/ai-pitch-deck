import { cn } from "@/lib/utils";

/** A small "+" drawn with two 1px lines, centred on a frame corner. Decorative. */
function CornerMark({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute size-[11px] -translate-x-1/2 -translate-y-1/2",
        "before:absolute before:top-0 before:left-1/2 before:h-full before:w-px before:-translate-x-1/2 before:bg-foreground/25 before:content-['']",
        "after:absolute after:top-1/2 after:left-0 after:h-px after:w-full after:-translate-y-1/2 after:bg-foreground/25 after:content-['']",
        className,
      )}
    />
  );
}

/** A full-viewport-width hairline (the page's <main> clips the overflow). */
function Rule({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("absolute left-1/2 h-px w-screen -translate-x-1/2 bg-border", className)}
    />
  );
}

/**
 * The shared frame of the sign-in and sign-up pages: a centred column bounded by vertical
 * hairlines, the title above, the card between two full-width hairlines with "+" marks where
 * the lines cross, and the switch link below. Built from tokens only.
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
    <div className="mx-auto flex w-full max-w-[31rem] flex-1 flex-col border-x border-border">
      <div className="flex flex-col items-center gap-3 px-6 pt-12 pb-8 text-center sm:pt-16">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
        <p className="max-w-[19rem] text-base leading-relaxed text-pretty text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <div className="relative px-3 py-3 sm:px-[0.6875rem] sm:py-3">
        <Rule className="top-0" />
        <Rule className="bottom-0" />
        <CornerMark className="top-0 left-0" />
        <CornerMark className="top-0 left-full" />
        <CornerMark className="top-full left-0" />
        <CornerMark className="top-full left-full" />
        <div className="rounded-2xl bg-card px-6 py-8 text-card-foreground shadow-xs ring-1 ring-foreground/10 sm:px-8">
          {children}
        </div>
      </div>

      <div className="px-6 py-8 text-center text-base text-muted-foreground">{footer}</div>
      <div className="flex-1" />
    </div>
  );
}
