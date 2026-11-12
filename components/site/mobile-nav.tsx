"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/src/auth/client";
import { BurgerMenuThreeIcon, LogOutRightIcon } from "@/src/components/icons";

import { useSignOut } from "./account-menu";
import { CREATE_DECK_HREF, SECTION_LINKS } from "./nav-links";

/**
 * Section links, "Create a deck" (hidden from the header on phones) and the account action,
 * below the md breakpoint.
 */
export function MobileNav() {
  const { data: session } = authClient.useSession();
  const signOut = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="rounded-full md:hidden"
        >
          <BurgerMenuThreeIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {SECTION_LINKS.map((link) => (
          <DropdownMenuItem key={link.href} asChild className="py-2">
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="py-2 font-medium text-primary">
          <Link href={CREATE_DECK_HREF}>Create a deck</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {session ? (
          <DropdownMenuItem onSelect={() => void signOut()} className="py-2">
            <LogOutRightIcon aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild className="py-2">
            <Link href="/sign-in">Sign in</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
