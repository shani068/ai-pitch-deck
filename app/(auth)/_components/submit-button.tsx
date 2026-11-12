import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** The design's outlined, full-width submit button, with a pending state. */
export function SubmitButton({ pending, children }: { pending: boolean; children: string }) {
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      aria-busy={pending || undefined}
      className="mt-1 h-12 w-full rounded-xl bg-card text-base font-medium dark:bg-input/20"
    >
      {pending ? <Spinner aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
