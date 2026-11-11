import Link from "next/link";

import { Logo } from "@/components/brand/logo";

import { Container } from "./container";
import { CREATE_DECK_HREF, SECTION_LINKS } from "./nav-links";

// A constant, not `new Date()`: reading the clock during render would make the page dynamic.
const COPYRIGHT_YEAR = 2026;

const FOOTER_LINKS = [
  ...SECTION_LINKS,
  { href: "/#faq", label: "FAQ" },
  { href: CREATE_DECK_HREF, label: "Create a deck" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Link
            href="/"
            aria-label="AI Pitch Deck home"
            className="-mx-1 self-start rounded-lg px-1 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo />
          </Link>
          <p className="text-sm text-muted-foreground">
            Investor-ready pitch decks from a single business idea, written by AI and checked by an
            independent reviewer.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3 md:grid-cols-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="border-t border-border py-6 text-sm text-muted-foreground">
        © {COPYRIGHT_YEAR} AI Pitch Deck. All rights reserved.
      </Container>
    </footer>
  );
}
