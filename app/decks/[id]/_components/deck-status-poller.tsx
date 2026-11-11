"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshIcon } from "@/src/components/icons";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Re-renders the deck page every `refreshInMs` while it is mounted. The server decides whether to
 * render this component, so polling ends by itself once the deck is complete, failed or stale.
 * Refreshes are skipped while the tab is hidden and resume as soon as it is visible again.
 */
export function DeckStatusPoller({ refreshInMs }: { refreshInMs: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(tick, refreshInMs);
    };

    function tick() {
      // While hidden, stop; the visibility handler restarts the loop.
      if (document.visibilityState === "hidden") return;
      router.refresh();
      schedule();
    }

    function onVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      schedule();
    }

    schedule();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router, refreshInMs]);

  return null;
}

/** One manual refresh, for the "taking longer than expected" notice. */
export function CheckAgainButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? <Spinner aria-hidden="true" /> : <RefreshIcon aria-hidden="true" />}
      Check again
    </Button>
  );
}
