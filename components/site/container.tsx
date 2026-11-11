import { cn } from "@/lib/utils";

/** The one content width every route shares, so headers, sections and footers line up. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}
