import { cn } from "@/lib/utils";

/** The shared section opener: a short label, the heading, and one supporting sentence. */
export function SectionHeading({
  id,
  label,
  title,
  description,
  className,
}: {
  id: string;
  label: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", className)}>
      <p className="text-sm font-semibold text-primary">{label}</p>
      <h2 id={id} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-lg text-pretty text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
