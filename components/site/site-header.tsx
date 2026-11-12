import Link from "next/link";

import { Wordmark } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { Button } from "@/components/ui/button";

import { Container } from "./container";
import { AccountMenu } from "./account-menu";
import { HeaderBar } from "./header-bar";
import { MobileNav } from "./mobile-nav";
import { CREATE_DECK_HREF, SECTION_LINKS } from "./nav-links";

/**
 * Wordmark and section links on the left, theme, account and "Create a deck" on the right. The
 * bar is see-through at the top of the page and becomes a rounded card once the page scrolls.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 pt-3 sm:pt-4">
      <Container>
        <HeaderBar>
          <Link
            href="/"
            aria-label="AI Pitch Deck home"
            className="-mx-1 shrink-0 rounded-full px-1 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex lg:ml-8">
            {SECTION_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-200 ease-out outline-none hover:bg-foreground/6 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-foreground/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <ThemeMenu />
            <AccountMenu />
            <MobileNav />
            <Button
              asChild
              size="lg"
              className="ml-1 hidden h-10 rounded-full bg-foreground px-5 font-semibold text-background shadow-md shadow-foreground/20 hover:bg-foreground/85 sm:inline-flex"
            >
              <Link href={CREATE_DECK_HREF}>Create a deck</Link>
            </Button>
          </div>
        </HeaderBar>
      </Container>
    </header>
  );
}
