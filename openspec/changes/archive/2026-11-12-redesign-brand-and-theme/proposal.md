# Proposal

## Why

The product works end to end, but it doesn't look like a product yet. The home page is a centred form under a starter header with a stock icon. The palette is shadcn's neutral greys. There is no way to choose light or dark mode. Icons come from lucide, although the project rules now require Pikaicons. This change gives the app a brand, a theme system and a real landing page. It is done before accounts are added, so the sign-in pages and the "My decks" dashboard planned next can be built on the new foundation.

## What Changes

- **Brand.** Add an original logo: a mark of stacked, rising slides plus the "AI Pitch Deck" wordmark. Use it in the header, the footer, the not-found page and the favicon (`app/icon.svg` replaces `favicon.ico`). It themes with the colour tokens.
- **Palette and type.** Replace the neutral greys with a professional, vibrant palette in light and dark: deep ink on warm paper, a vivid indigo primary and a sparing coral highlight. Add a display face (Outfit) for headings and keep Geist for body text and code.
- **Theme system. BREAKING for the design-system rule "dark mode follows the OS without a toggle".**
  - Dark mode switches by a class instead of only the media query.
  - With no saved choice, the app follows the OS. A theme menu on every page (Light, Dark, System) overrides it, and the choice is remembered in the browser.
  - The correct theme is applied before first paint, with no flash.
  - AGENTS.md is updated to match.
- **Icons.** Use Pikaicons for every icon, including those inside shadcn components. Remove `lucide-react` once nothing imports it. Fix AGENTS.md's Pikaicons commands to use `vp dlx` instead of `npx`.
- **Interaction states.** Every clickable element shows a pointer cursor. Buttons, links and inputs share hover, focus-visible, active and disabled states.
- **Site shell.**
  - A sticky header with the logo, section links (How it works, Features, Example), the theme menu and a primary "Create a deck" action.
  - The links collapse into a menu on small screens.
  - A footer with the logo, a tagline and links.
- **Home page redesign.** A landing page:
  - Hero: headline, the idea form and a preview of a real sample slide.
  - A strip of product facts.
  - How it works, as three steps.
  - A feature bento grid.
  - A full sample-deck strip.
  - FAQ, a closing call to action, and the footer.
  - It uses the structure of professional product sites, but without animated backgrounds, glows, gradients, 3D effects, marquees or invented social proof.
- **Consistency.** The deck page and not-found page use the new type, tokens, icons and states.

Out of scope: accounts, sign-in and sign-up, deck ownership and the "My decks" dashboard (the next change); new animation libraries; changes to the generation backend or the data model.

## Capabilities

### New Capabilities

- `site-shell`: the header, navigation, mobile menu, theme menu and footer shared by every page, and how the brand appears in them.
- `marketing-home`: the home page's sections, their content rules (true claims only, a real sample deck) and its responsive behaviour.

### Modified Capabilities

- `design-system`: the colour scheme now follows the OS only until the visitor picks a theme, and that pick is remembered and applied without a flash. Typography adds a display face for headings. New requirements cover shared interaction states and a single icon library.

## Impact

- **Code:**
  - `app/globals.css`: tokens, a class-based `dark` variant and base interaction styles.
  - `app/layout.tsx`: fonts, the theme script and the shell.
  - `app/page.tsx` and new `app/_components/*` for the home sections.
  - New `components/brand/*` (logo) and `components/theme/*` (theme menu).
  - `app/icon.svg` replaces `app/favicon.ico`.
  - Icon swaps in `components/ui/spinner.tsx`, the idea form, the deck page components and the not-found page.
  - `AGENTS.md` theme and icon rules.
- **Dependencies:**
  - Remove `lucide-react`.
  - Pikaicons components are generated into the project by the Pikaicons CLI (`vp dlx pikaicons add`), so no runtime icon package is added.
  - The Outfit font is served through `next/font/google`, already part of Next.js.
  - `components/ui/dropdown-menu` is added from shadcn on the installed `radix-ui`.
- **Tooling:** running the Pikaicons CLI needs permission in this environment, because the session's permission check blocked it. Either allow `vp dlx pikaicons` or run the listed `add` commands by hand.
- **Prerequisite:** `add-deck-generation-ui` is still open and owns the current home and deck pages. Archive it first, so this change's specs build on its synced specs.
- **Security:** the theme script is a static inline string with no user data, allowed by the existing CSP (`script-src 'unsafe-inline'`). Theme choice lives in `localStorage`, which holds no secret and is a per-visitor convenience only.
