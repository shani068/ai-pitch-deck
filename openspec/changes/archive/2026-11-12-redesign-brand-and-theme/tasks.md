# Tasks

Verification notes:

- Run `vp check` where a task says so. If it hits the known vite-plus `configDefaults` cycle (see the README), use `vp exec tsc --noEmit` plus `vp lint` instead and say so.
- HTML checks use `curl` against `vp run dev`.
- Checks marked **(browser)** need a human in a real browser. The agent cannot run them, so it must report them as open rather than tick them.

## 1. Prerequisites and setup

- [x] 1.1 Confirm that `add-deck-generation-ui` has been archived (`openspec/changes/add-deck-generation-ui/` is gone and `openspec/specs/deck-viewing/` exists). If it has not, stop and ask before going on.
- [x] 1.2 Add the shadcn `dropdown-menu` component with `vp dlx shadcn@latest add dropdown-menu`. Verify that `components/ui/dropdown-menu.tsx` exists and that `git diff package.json bun.lock` is empty. If either file changed, stop and ask.

## 2. Tokens, typography and theme

- [x] 2.1 Rewrite the tokens in `app/globals.css` (design D1, D2, D5): - `@custom-variant dark (&:where(.dark, .dark *))`; - light tokens in `:root` and dark tokens in `.dark`, with matching `color-scheme`; - the new `--highlight` token, exposed as `--color-highlight` in `@theme inline`; - re-tinted chart and sidebar tokens; - the base rules: pointer cursor, `:focus-visible` fallback, reduced motion, `section[id]` scroll margin and heading font.

      Verify with `vp check`, and by reading the diff: no `prefers-color-scheme` media query remains in the token blocks.

- [x] 2.2 Write a throwaway contrast script in the scratchpad that converts the oklch token values from `globals.css` to sRGB and prints WCAG ratios. Pairs: foreground, muted-foreground and primary on background, card and muted; primary-foreground on primary; destructive on background; ring on background; in both schemes. Adjust lightness until every text pair is at least 4.5:1 and ring and icon pairs are at least 3:1. Verify by pasting the final table into the task summary. Do not commit the script.
- [x] 2.3 Load Outfit (500, 600, 700) with `next/font/google` as `--font-outfit` in `app/layout.tsx`, and point `--font-heading` at it. Keep Geist Sans and Geist Mono. Verify with `vp run build` (no font request to another origin), and with `curl` of `/`: the HTML links font files from `/_next/static/media/`.
- [x] 2.4 Create `components/theme/theme.ts` with `ThemeChoice` (`"light" | "dark" | "system"`), `resolveTheme(stored, prefersDark)` and the constant `THEME_SCRIPT` string (design D2). Create `components/theme/theme-script.tsx`, which renders it in `<head>` with a one-line comment justifying `dangerouslySetInnerHTML` (constant, no user data). Add `components/theme/theme.test.ts`. It evaluates `THEME_SCRIPT` with fake `document.documentElement.classList`, `localStorage` (including one that throws) and `matchMedia`, and asserts the class for every combination of stored value and OS preference, matching `resolveTheme`. Verify with `vp test`.
- [x] 2.5 Create `components/theme/theme-menu.tsx` (`"use client"`): - a dropdown menu with a Light, Dark and System radio group; - current state from `useSyncExternalStore` over storage and the media query; - writes and clears storage, toggles `.dark` at once, and follows OS changes in System mode; - an icon trigger with `aria-label="Change theme"`.

      Verify with `vp check`. The behaviour is checked in 7.3 **(browser)**.

## 3. Icons (Pikaicons)

- [x] 3.1 For each concept in design D4, run `vp dlx pikaicons search` and choose free icons. Then run `vp dlx pikaicons add <names...>`. If the command is blocked by permissions, stop and give the user the exact `add` command to run. Verify that the generated component files exist, and record their directory and import line in the task summary.
- [x] 3.2 Replace every lucide icon with its Pikaicons equivalent: - `app/layout.tsx`; - `app/_components/idea-form.tsx`; - `app/decks/[id]/not-found.tsx`; - `app/decks/[id]/_components/deck-view.tsx`, `deck-status-poller.tsx` and `retry-form.tsx`; - `components/ui/spinner.tsx` (with `motion-safe:animate-spin`); - `components/ui/dropdown-menu.tsx`.

      Keep `aria-hidden` on decorative icons and an accessible name on icon-only buttons. Verify with `vp check`, and with `rg "lucide" app components src`, which must return no matches.

- [x] 3.3 Run `vp remove lucide-react`. Update AGENTS.md's Icons section: - `vp dlx pikaicons ...` replaces `npx pikaicons ...`; - the generated icon directory; - shadcn components arrive with lucide icons, which must be swapped; - the brand mark is the only hand-authored SVG.

      Verify that `package.json` no longer lists `lucide-react`, and with `vp check` and `vp run build`.

## 4. Brand and site shell

- [x] 4.1 Create `components/brand/logo.tsx` with `LogoMark` and `Logo` (design D3), using token `fill-*` classes. Add `app/icon.svg` with the same mark and an internal dark-scheme style, and delete `app/favicon.ico`. Verify with `vp check`, and with `curl -sI` of the icon URL in the rendered `<head>`, which must return 200 with `image/svg+xml`.
- [x] 4.2 Create `components/site/container.tsx`, `components/site/site-header.tsx` and `components/site/mobile-nav.tsx` (design D6): - a sticky solid header with the logo link (`aria-label="AI Pitch Deck home"`); - the section links; - `ThemeMenu`; - "Create a deck" linking to `/#create`; - `MobileNav`, with an "Open menu" trigger visible below `md` and the inline links hidden there.

      Verify with `vp check`. The keyboard and narrow-width behaviour is checked in 7.3 **(browser)**.

- [x] 4.3 Create `components/site/site-footer.tsx` with the logo, a one-line description, section links and a constant copyright line. Verify with `vp check`.
- [x] 4.4 Wire the shell into `app/layout.tsx`: `suppressHydrationWarning` on `<html>`, `<ThemeScript/>` in `<head>`, then `SiteHeader`, children and `SiteFooter`. Remove the old inline header. Update AGENTS.md's dark-mode rule to: "theme is class-based (`.dark` on `<html>`), defaults to the OS, and is switched by `components/theme/theme-menu.tsx`; no theme libraries". Update the README Features line about dark mode. Verify with `curl`: - `/` and a deck URL both contain the header (logo link, the three section links, "Change theme", "Create a deck") and the footer; - the theme script appears in `<head>` before any stylesheet link.
- [x] 4.5 In `app/_components/idea-form.tsx`, focus the textarea when the page loads with `#create` and on `hashchange` to `#create`. Restyle the form and its example buttons with the new tokens. Verify with `vp check`, and by confirming the existing submission still works: a valid idea posted with the no-JS form helper returns `303` to `/decks/<id>`. Focus behaviour is checked in 7.3 **(browser)**.

## 5. Home page

- [x] 5.1 Create `app/_content/sample-deck.ts`, exporting the locally generated OfficeRoast deck (title and all slides with title and content) typed as `PitchDeck`. Read it once from the local database with a throwaway script, and do not commit the script. Verify with `vp check`, and that the file has no image URLs.
- [x] 5.2 Create `app/_components/home/hero.tsx` and `slide-stack.tsx` (design D7): the label, h1 and supporting sentence, `<IdeaForm/>` in a card inside `id="create"`, and the typographic slide preview with two offset slides behind it (translate only). On narrow screens the form comes first. Verify with `vp check`, and with `curl` of `/`: an `h1`, `id="create"` and the `idea` textarea are present.
- [x] 5.3 Create `facts.tsx` (four true facts) and `how-it-works.tsx` (`id="how-it-works"`, three numbered steps). Verify with `vp check`.
- [x] 5.4 Create `features.tsx` (`id="features"`), the six-column bento grid with five cells, each with a Pikaicon, a title, one line and a token-built mini visual. Verify with `vp check`.
- [x] 5.5 Create `example-deck.tsx` (`id="example"`), showing the sample deck title and every slide in order, numbered with Geist Mono labels. Verify with `curl` of `/`: every sample slide title appears in order.
- [x] 5.6 Create `faq.tsx` with at least the four questions from design D7, using native `<details>` and `<summary>` and a chevron Pikaicon that rotates with `group-open`. Create `closing-cta.tsx`, a primary band with a `<a href="#create">` button. Verify with `vp check`, and that the "who can see my deck" answer says anyone with the link.
- [x] 5.7 Compose `app/page.tsx` in the spec order and update its metadata description. Verify with `curl` of `/`: - the section ids appear in the order hero (`create`), `how-it-works`, `features`, `example`, then the FAQ and CTA; - no `http://` or `https://` URL appears inside `<main>`; - `rg -i "trusted by|testimonial|★|\$[0-9]|/mo"` on the rendered HTML finds nothing.

      Then run `vp run build` and confirm `/` is still listed as static.

## 6. Existing pages

- [x] 6.1 Restyle `app/decks/[id]/page.tsx`, its skeleton, `_components/*` and `not-found.tsx` with `<Container>` and the new tokens. Their structure and behaviour stay as they are. Verify with `vp check` and `vp test`, and with `curl` of a completed, a failed and an unknown deck: the same badges, alerts, retry form and not-found text as before, now inside the shared header and footer.

## 7. Integration checks

- [x] 7.1 Run `vp check`, `vp test` and `vp run build`, and confirm all three pass. Confirm that the route table shows `/` as static and `/decks/[id]` as partial prerender. Then run `rg -n "bg-gradient|bg-linear|from-|via-|transform-3d|perspective-|animate-(?!spin)" app components`, which must find nothing.
- [x] 7.2 Run one end-to-end deck generation in placeholder mode (`vp run dev` and the Inngest dev server) from the new hero. Verify that the deck completes and its page renders inside the new shell.
- [ ] 7.3 **(browser)** In light and in dark, at 375, 768 and 1280 px: - no horizontal scroll; - the header stays on top while scrolling; - the mobile menu opens, closes, and its links scroll to their sections; - the theme menu works by mouse and keyboard, survives a reload without a flash, and System follows an OS change live; - "Create a deck" from a deck page lands in the focused idea field; - every button and link shows a pointer, and keyboard focus is always visible; - with reduced motion on, nothing transitions.

      Record the results in the task summary.

- [x] 7.4 State the security handling in the task summary: - the constant inline theme script (no user data, CSP unchanged); - `localStorage` holds only the theme choice; - no new remote origins (fonts self-hosted, no images on `/`); - links are relative; - no fabricated claims; - `lucide-react` removed.

## Workflow follow-up

- Archive this change with `/opsx:archive` after review.
- Next change: `add-auth-and-my-decks` (Better Auth, owner-only decks, "My decks" dashboard). It updates the FAQ answer about who can see a deck and adds "My decks" to the header.
