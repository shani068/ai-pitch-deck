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
import { BurgerMenuThreeIcon } from "@/src/components/icons";

import { CREATE_DECK_HREF, SECTION_LINKS } from "./nav-links";

/** Section links (and "Create a deck", hidden from the header on phones) below the md breakpoint. */
export function MobileNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
