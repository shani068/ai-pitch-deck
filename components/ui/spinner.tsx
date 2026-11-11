import { cn } from "cn";
import { RefreshIcon } from "@/src/components/icons";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <RefreshIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 motion-safe:animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
