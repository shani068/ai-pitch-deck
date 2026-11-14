import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** Full-width submit in the site's primary dark style (as the hero's "Create a deck"), with a pending state. */
export function SubmitButton({ pending, children }: { pending: boolean; children: string }) {
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="mt-2 h-12 w-full rounded-xl bg-foreground text-base font-semibold text-background shadow-lg shadow-foreground/15 transition-[translate,scale,background-color,box-shadow] duration-500 ease-apple hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-xl hover:shadow-foreground/20 active:translate-y-0 active:scale-[0.98] active:duration-150"
    >
      {pending ? <Spinner aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
