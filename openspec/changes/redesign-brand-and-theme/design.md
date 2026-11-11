# Design

## Context

See proposal.md for motivation. Current state that shapes the approach:

- **Theme.** `app/globals.css` declares `@custom-variant dark (@media (prefers-color-scheme: dark))`, and dark tokens sit inside the same media query. The tokens are shadcn's neutral `oklch(... 0 0)` greys. `--font-heading` already exists in `@theme` and points at Geist.
- **Rendering.** `next.config.ts` has `cacheComponents: true` and a static CSP with `script-src 'self' 'unsafe-inline'` and `font-src 'self'`. Reading cookies or headers in the root layout would make every route dynamic and lose the partial prerendering that `/` and `/decks/[id]` use today.
- **Icons.** lucide is imported in `app/layout.tsx`, `app/_components/idea-form.tsx`, `app/decks/[id]/not-found.tsx`, three `app/decks/[id]/_components/*` files and `components/ui/spinner.tsx`. AGENTS.md now requires Pikaicons, through a CLI that writes React components into the project (`pikaicons search | add | show`). The CLI could not be run while planning because the session's permission check blocked it. The output directory and the exact icon names are therefore confirmed during implementation.
- **shadcn.** `components.json` has `iconLibrary: "lucide"`. shadcn has no Pikaicons option, so components added later still arrive with lucide imports and must be swapped.
- **Pages.** The home page and deck pages come from the still-open change `add-deck-generation-ui`. The idea form (`app/_components/idea-form.tsx`) and its Server Action stay functionally unchanged.
- **Sample content.** The local database holds one real generated deck ("OfficeRoast: Better Coffee for Small Teams", 7 slides) from the end-to-end run.
- **Tests.** Vitest runs through `vp test`. There are no browser tests, and no browser automation is available in the agent environment.

## Goals / Non-Goals

**Goals:**

- One token set per scheme, one display face, one icon library and one interaction-state baseline that every route inherits.
- Theme switching without a flash and without making any route dynamic.
- A home page with a clear hierarchy built from plain components: no new UI, animation or theme library.

**Non-Goals:**

- Accounts, a "My decks" entry in the navigation, or owner-only access. These come in the next change, which also updates the FAQ answer about who can see a deck.
- Rewriting the deck page. It only picks up the new tokens, type, icons and shell.
- A design-token pipeline or a Storybook.

## Decisions

### D1. Palette: Direction A, "Ink and Signal" (default)

The tokens keep shadcn's names, so every existing component re-themes without edits. One extra token, `--highlight`, is for small brand marks only: the logo spark, the step numbers and the active-section bar. It is never used for body text.

| Token                              | Light                    | Dark                    |
| ---------------------------------- | ------------------------ | ----------------------- |
| background (warm paper / deep ink) | `oklch(0.985 0.004 85)`  | `oklch(0.17 0.02 272)`  |
| foreground                         | `oklch(0.21 0.03 270)`   | `oklch(0.96 0.005 85)`  |
| card / popover                     | `oklch(1 0 0)`           | `oklch(0.21 0.022 272)` |
| primary (vivid indigo)             | `oklch(0.51 0.23 277)`   | `oklch(0.7 0.16 278)`   |
| primary-foreground                 | `oklch(0.99 0 0)`        | `oklch(0.17 0.03 272)`  |
| secondary / accent (indigo tint)   | `oklch(0.955 0.015 277)` | `oklch(0.26 0.03 274)`  |
| secondary / accent foreground      | `oklch(0.27 0.06 275)`   | `oklch(0.93 0.01 277)`  |
| muted                              | `oklch(0.96 0.006 85)`   | `oklch(0.24 0.02 272)`  |
| muted-foreground                   | `oklch(0.47 0.02 270)`   | `oklch(0.72 0.015 270)` |
| border / input                     | `oklch(0.91 0.008 85)`   | `oklch(1 0 0 / 11%)`    |
| ring                               | = primary                | = primary               |
| highlight (coral)                  | `oklch(0.66 0.19 35)`    | `oklch(0.74 0.15 40)`   |
| destructive                        | `oklch(0.56 0.22 27)`    | `oklch(0.7 0.19 22)`    |

The chart and sidebar tokens are re-tinted to match. These values are starting points: task 2.2 checks contrast with a script and adjusts lightness until every pair meets the spec's targets.

**Type:**

- **Outfit** for headings, at weights 500, 600 and 700.
- **Geist Sans** for body text and UI.
- **Geist Mono** for small data labels such as "Slide 3 of 7".

The scale:

- Hero headline: `text-4xl` on mobile, `sm:text-5xl`, `lg:text-6xl`, `leading-[1.05]`.
- Section headings: `text-3xl` on mobile, `sm:text-4xl`.
- Body: `text-base` or `text-lg`.
- Labels: `text-sm`.

All headings use sentence case. There are no all-caps eyebrows.

_Alternatives, to swap in before implementation if preferred; the tasks stay the same:_

- **B. "Boardroom":** deep navy primary `oklch(0.36 0.09 260)`, an emerald highlight and Plus Jakarta Sans throughout. Calmer and more corporate.
- **C. "Studio":** the Calistoga display serif with Inter body, a warm off-white background and a burnt-orange primary. More editorial, less "tech".

The ui-ux-pro-max design-system query suggested glassmorphism with a stock blue and orange palette. That was rejected as exactly the generic look this change is meant to avoid.

### D2. Theme: a class on `<html>`, set by a static inline script before paint

- **CSS:**
  - `@custom-variant dark (&:where(.dark, .dark *));`
  - Light tokens go in `:root`, dark tokens in `.dark`.
  - `color-scheme: light` and `color-scheme: dark` are set alongside, so native controls and scrollbars match.
- **`components/theme/theme-script.tsx`** renders `<script>` with a constant string in `<head>`. The script:
  - reads `localStorage.theme`, which is `"light"`, `"dark"` or missing;
  - resolves "missing" or `"system"` with `matchMedia("(prefers-color-scheme: dark)")`;
  - toggles `.dark` on `document.documentElement`;
  - falls back to the media query if storage throws.

  The string contains no user data. This is the one justified use of `dangerouslySetInnerHTML` in the app, and the existing CSP already allows it.

- **`<html suppressHydrationWarning>`**, because the server cannot know the class.
- **`components/theme/theme-menu.tsx`** (`"use client"`): a shadcn `dropdown-menu` with a radio group (Light, Dark, System).
  - Its state comes from `useSyncExternalStore` over storage and the media query, so there is no `useEffect` flash.
  - Choosing an option writes storage (or removes it for System) and toggles the class immediately.
  - While following the system, it listens for media-query changes.
  - The trigger is an icon button named "Change theme", showing a sun, a moon or a monitor icon.
- **Pure logic in `components/theme/theme.ts`.** `resolveTheme(stored, prefersDark)` and the script string both live here. A Vitest test runs the script string against a fake `document`, `localStorage` and `matchMedia`, and checks that it agrees with `resolveTheme`.

_Alternatives:_

- **A theme cookie read in the root layout.** It needs no script, but it makes every page dynamic under `cacheComponents`.
- **`next-themes`.** A theme library, which the project rules disallow.

**Accepted gap:** with JavaScript disabled, the page renders light, because no class is ever set.

### D3. Brand: an original mark plus a live-text wordmark

- **The mark: three rounded rectangles, the "slides".** They are staggered up and to the right like a rising step chart. The back slide uses `muted-foreground` at reduced opacity, the middle one `primary` at about 55% and the front one solid `primary`. A small `highlight` square ("the spark") sits at the front slide's top-right corner. It reads as "deck" and "growth" without being a stock glyph.
- **`components/brand/logo.tsx`** exports:
  - `LogoMark`: inline SVG, `viewBox="0 0 32 32"`, fills from Tailwind `fill-*` token classes, `aria-hidden`.
  - `Logo`: the mark plus the wordmark "AI Pitch Deck" as live text in `font-heading` at weight 600, with "AI" in `text-primary`.

  Live text means the wordmark inherits the font, scales and themes with no extra artwork.

- **`app/icon.svg`** (the Next.js metadata convention) replaces `app/favicon.ico`. It is the same mark with literal colours and an internal `@media (prefers-color-scheme: dark)` block, because favicons can't read page tokens.
- **AGENTS.md exception:** AGENTS.md gains one line. The brand mark is the only hand-authored SVG, and all icons still come from Pikaicons.

### D4. Icons: Pikaicons via the CLI, one icon module per use

- Search for each icon with `vp dlx pikaicons search "<concept>"` and add the chosen free (unlocked) icons with `vp dlx pikaicons add ...`. Keep the components wherever the CLI writes them, and record that location in AGENTS.md.
- **Concepts needed:** menu, close, sun, moon, monitor, arrow-right, arrow-left, check, chevron-down, refresh (retry and check again), clock, alert-circle, loader, layers or slides (story structure), shield-check (quality review), image, link, and lightning or timer (speed).
- **Swaps:** every current lucide import, plus the icons inside shadcn's `spinner` and `dropdown-menu`.
- **The spinner** uses `motion-safe:animate-spin`, so reduced motion leaves it still.
- **Removing lucide:** when no lucide import is left, run `vp remove lucide-react`. `components.json` keeps `iconLibrary: "lucide"`, because shadcn has no Pikaicons option. AGENTS.md says to swap icons in any newly added shadcn component.
- **Accessibility:** decorative icons get `aria-hidden="true"`. Icon-only buttons get an `aria-label` or a visually hidden label.

**If the CLI stays blocked:** implementation pauses at task 3.1, and you run the listed `add` commands yourself.

### D5. Interaction baseline in `globals.css`

These rules go in `@layer base`:

- **Pointer cursor:** `cursor: pointer` on `button:not(:disabled)`, `[role="button"]:not([aria-disabled="true"])`, `[role^="menuitem"]`, `summary`, `a[href]`, `label[for]` and `select`. Tailwind v4 defaults buttons to `cursor: default`, so this rule is needed.
- **Disabled:** shadcn components already use `disabled:pointer-events-none disabled:opacity-50`, which means no pointer and no hover.
- **Focus ring:** a `:focus-visible` fallback of `outline-2 outline-offset-2 outline-ring` for elements that lack the shadcn `focus-visible:ring-*` classes, such as plain links.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` sets transition and animation duration to near zero.
- **Anchor offset:** `scroll-margin-top: 5rem` on `section[id]`, so the sticky header doesn't cover in-page anchor targets.
- **Headings:** `h1, h2, h3 { font-family: var(--font-heading) }`.

### D6. Shell: `components/site/*`, rendered once in the root layout

```
app/layout.tsx
  <html suppressHydrationWarning> <head><ThemeScript/></head>
  <body> <SiteHeader/> {children} <SiteFooter/> </body>
components/site/
  site-header.tsx   server: sticky top-0 z-40 border-b bg-background (solid, no blur)
                    [Logo] [How it works|Features|Example]  [ThemeMenu] [MobileNav] [Create a deck]
  mobile-nav.tsx    "use client": dropdown-menu, trigger "Open menu", visible below md
  site-footer.tsx   server: Logo, one-line description, section links, (c) year
  container.tsx     mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 (shared width for every route)
```

- **Links:** section links are `next/link` to `/#how-it-works` and so on, so they work from deck pages too.
- **"Create a deck":** a link to `/#create`. `IdeaForm` focuses its textarea when it mounts with `location.hash === "#create"` and on `hashchange`. The hero wraps the form in `id="create"`. In-page CTAs use a plain `<a href="#create">`, so the hash change fires.
- **Footer year:** the copyright year is a constant, not computed at render.

### D7. Home page composition

```
app/page.tsx (server, static)
  <Hero/>          grid lg:grid-cols-[1.05fr_0.95fr]
                   left: label "For early-stage founders", h1, one sentence, <IdeaForm/> in a card (#create)
                   right: <SlideStack/>: the sample deck's slide 2 as a 16:9 slide card, with two slides
                          offset behind it (translate only, no rotation, no 3D), echoing the logo mark
  <Facts/>         4-cell bordered strip: 5-8 slides | Independent quality review | An image per slide | Ready in minutes
  <HowItWorks/>    3 numbered steps (number in highlight), connected by a rule on md+
  <Features/>      bento grid md:grid-cols-6:
                   Investor story structure (span 4, mini outline of slide types)
                   Quality review (span 2) | Images per slide (span 2) | Live progress (span 2) | Deck link (span 2)
  <ExampleDeck/>   title + grid sm:2 lg:3 of the sample deck's slides (number, title, content)
  <Faq/>           native <details>/<summary>, chevron rotates with group-open
  <ClosingCta/>    bordered band, bg-primary text-primary-foreground, "Create your deck" -> #create
```

- **Sections** use the shared container, `py-20 sm:py-24` and a `border-t` between them. Each has a short `text-primary` label above an `h2`.
- **Cards** are `bg-card ring-1 ring-foreground/10 rounded-xl`, the same recipe as the existing shadcn `card`.
- **No images:** slide previews are typographic slide cards built from tokens (slide label, title, content and a few token-coloured bars as a stand-in visual), so the home page makes no remote requests.
- **Sample data:** `app/_content/sample-deck.ts` exports the locally generated OfficeRoast deck (title and slides), copied once, typed with `PitchDeck` from `src/ai/pitch-deck/schema.ts`, which has no `server-only` import. The page says only "An example deck", not "generated in N seconds".
- **FAQ answers** are true at the time:
  - **Who can see my deck?** Anyone with its link. Owner-only access comes with accounts.
  - **What you get:** 5 to 8 slides.
  - **How long it takes:** usually a few minutes.
  - **What makes a good idea:** customer, problem, how you make money.

### D8. Restyling existing pages

The deck page, its skeleton and the not-found page:

- switch to `<Container>`;
- get headings in `font-heading` automatically through the base rule;
- swap in Pikaicons;
- keep their structure and behaviour.

The idea form gets the new card treatment and focus handling (D6). Its example-idea buttons stay.

### D9. Verification without a browser tool

Automated checks:

- `vp check`, `vp test` and `vp run build`;
- the theme-script test;
- a throwaway contrast script that converts the oklch tokens to sRGB and computes WCAG ratios for every text pair in both schemes;
- `rg` checks that no `lucide-react` import, gradient utility (`bg-gradient`, `bg-linear`, `from-*`/`via-*`/`to-*`), `transform-3d` or `perspective` remains;
- HTTP checks of the rendered HTML for section order, ids, header links, the absence of invented claims, and the absence of remote URLs on `/`.

The visual review in both themes at 375, 768 and 1280 px is a final task for you in a browser.

## Risks / Trade-offs

- **[Pikaicons CLI blocked or icons locked]** The free tier has about 220 icons, so some concepts may need a substitute. → Each concept lists two search terms. Implementation pauses rather than mixing libraries.
- **[No-JS visitors always see light]** → Accepted. The page stays fully usable, and it matches every major theme approach without cookies.
- **[Inline script is an `dangerouslySetInnerHTML` exception]** → It is a constant with no interpolation, is covered by a unit test and is named in AGENTS.md. The CSP is unchanged.
- **[A future shadcn add brings lucide back]** → The AGENTS.md rule is updated, and a task greps for `lucide` as part of `vp check` hygiene.
- **[Palette taste]** → Directions B and C are documented and swap token values only, without changing tasks.
- **[Removing a dependency is slow here]** `vp install` was measured at about 18 minutes on this machine. → `vp remove lucide-react` runs once at the end of the icon group.

## Migration Plan

1. Archive `add-deck-generation-ui` first: finish its 4 browser checks, or archive with them noted, so its specs are synced.
2. Implement this change. There is no data migration and no environment change.
3. Rollback is reverting the commit. Re-adding `lucide-react` is only needed if the icon swap is reverted.

## Open Questions

- **Palette direction:** A (default), B or C. This only changes token values and fonts in D1, so it can be decided any time before task 2.1.
