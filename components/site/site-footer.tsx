import Link from "next/link";

import { Wordmark } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/src/components/icons";

import { Container } from "./container";
import { CREATE_DECK_HREF, SECTION_LINKS } from "./nav-links";

// A constant, not `new Date()`: reading the clock during render would make the page dynamic.
const COPYRIGHT_YEAR = 2026;

const COLUMNS = [
  { title: "Product", links: [...SECTION_LINKS, { href: "/#faq", label: "FAQ" }] },
  {
    title: "Get started",
    links: [
      { href: CREATE_DECK_HREF, label: "Create a deck" },
      { href: "/sign-up", label: "Create an account" },
      { href: "/sign-in", label: "Sign in" },
    ],
  },
];

/**
 * Brand, a call to action and two link columns, a slim bottom bar with the theme switch, then
 * the wordmark set huge and faint, cropped by the page's bottom edge.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto overflow-hidden border-t border-border">
      <Container className="grid gap-12 pt-14 pb-12 md:grid-cols-[1.5fr_1fr_1fr] md:gap-8">
        <div className="flex max-w-sm flex-col items-start gap-5">
          <Link
            href="/"
            aria-label="AI Pitch Deck home"
            className="-mx-1 rounded-lg px-1 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Wordmark />
          </Link>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            Investor-ready pitch decks from a single business idea, written by AI and checked by an
            independent reviewer.
          </p>
          <Link
            href={CREATE_DECK_HREF}
            className={cn(
              buttonVariants(),
              "group h-10 rounded-full bg-foreground px-5 font-semibold text-background transition-[translate,scale,background-color] duration-500 ease-apple hover:-translate-y-0.5 hover:bg-foreground/90 active:translate-y-0 active:scale-[0.97] active:duration-150",
            )}
          >
            Create a deck
            <ArrowRightIcon
              aria-hidden="true"
              className="transition-transform duration-300 ease-apple group-hover:translate-x-0.5"
            />
          </Link>
          <p className="font-mono text-xs text-muted-foreground">
            5 to 8 slides · independent review · an image per slide
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-2">
          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <p className="text-sm font-semibold">{column.title}</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                {column.links.map((link) => (
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
            </div>
          ))}
        </nav>
      </Container>

      <Container>
        <div className="flex items-center justify-between gap-4 border-t border-border py-5 text-sm text-muted-foreground">
          <p>© {COPYRIGHT_YEAR} AI Pitch Deck. All rights reserved.</p>
          <ThemeMenu />
        </div>
      </Container>

      {/* Decorative wordmark; the negative margin lets the page's bottom edge crop it. */}
      <Container aria-hidden="true" className="pointer-events-none select-none">
        <p className="-mb-[0.22em] bg-linear-to-b from-foreground/10 to-foreground/0 bg-clip-text text-center font-heading text-[13.5vw] leading-none font-semibold tracking-[-0.06em] whitespace-nowrap text-transparent lg:text-[9.75rem]">
          AI Pitch Deck
        </p>
      </Container>
    </footer>
  );
}
