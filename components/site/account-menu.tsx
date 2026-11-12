"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/src/auth/client";
import { LogOutRightIcon } from "@/src/components/icons";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** Ends the session on the server, then re-renders so nothing signed-in stays on screen. */
export function useSignOut() {
  const router = useRouter();
  return async () => {
    await authClient.signOut();
    router.refresh();
  };
}

/**
 * The account slot in the header. The session is read in the browser, so pages stay static and
 * rendering them never queries the database. The slot has a fixed width, so swapping the
 * placeholder for "Sign in" or the avatar never shifts the header.
 */
export function AccountMenu() {
  const { data: session, isPending } = authClient.useSession();
  const signOut = useSignOut();

  return (
    <div className="flex w-[4.75rem] shrink-0 justify-end">
      {isPending ? (
        <span aria-hidden="true" className="size-8 rounded-full bg-muted" />
      ) : session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Account menu for ${session.user.name}`}
              className="rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
            >
              {initials(session.user.name)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
              <span className="truncate text-sm font-medium text-foreground">
                {session.user.name}
              </span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {session.user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut()} className="py-2">
              <LogOutRightIcon aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant="ghost" size="lg" className="rounded-full px-3">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      )}
    </div>
  );
}
