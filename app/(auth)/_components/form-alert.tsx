import { AlertCircleIcon } from "@/src/components/icons";

/** A form-level error (wrong credentials, rate limit, server trouble), announced when it appears. */
export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
    >
      <AlertCircleIcon aria-hidden="true" className="mt-px size-4 shrink-0" />
      {children}
    </p>
  );
}
