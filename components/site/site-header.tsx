import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { Button } from "@/components/ui/button";

import { Container } from "./container";
import { MobileNav } from "./mobile-nav";
import { CREATE_DECK_HREF, SECTION_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex h-16 items-center gap-3">
        <Link
          href="/"
          aria-label="AI Pitch Deck home"
          className="-mx-1 rounded-lg px-1 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeMenu />
          <MobileNav />
          <Button asChild size="lg" className="ml-1.5 hidden px-4 sm:inline-flex">
            <Link href={CREATE_DECK_HREF}>Create a deck</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
