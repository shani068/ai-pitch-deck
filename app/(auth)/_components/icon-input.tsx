import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UserIcon } from "@/src/components/icons";

export type IconInputProps = Omit<React.ComponentProps<"input">, "id"> & {
  id: string;
  /** Accessible label; the placeholder is the visible hint, as in the design. */
  label: string;
  icon: typeof UserIcon;
  error?: string;
  /** Trailing control inside the field, such as the password visibility toggle. */
  trailing?: React.ReactNode;
};

/** A 48px field with a muted leading icon, a visually hidden label and an error line below. */
export function IconInput({
  id,
  label,
  icon: Icon,
  error,
  trailing,
  className,
  ...props
}: IconInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-12 rounded-xl bg-card pr-4 pl-11 text-base md:text-base dark:bg-input/20",
            trailing ? "pr-12" : undefined,
            className,
          )}
          {...props}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} className="px-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
