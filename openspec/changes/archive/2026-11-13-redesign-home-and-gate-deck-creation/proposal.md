# Proposal

## Why

The home page and header were redesigned, and deck creation was moved behind sign-in, at the product owner's request. That work is built but not specified: the main specs still describe the idea form in the hero, a "restrained" design that forbids glows, gradients and scroll-driven animation, and decks that anyone can create without an account. This change records the shipped behaviour so the specs match the product again.

## What Changes

- **Header:** the header shows the "AI Pitch Deck" wordmark without the mark. At the top of a page the bar has no background; once the page scrolls, a rounded, blurred bar fades in. Section links sit next to the wordmark and show a soft background on hover. "Create a deck" is a dark pill and goes to `/new`.
- **Hero:** the idea form leaves the home page. The hero has an eyebrow, a two-tone headline, a short description, "Create a deck" and "See an example" actions, and a decorative deck-editor preview built from the sample deck. Its content rises in on load, and its buttons lift smoothly on hover.
- **At a glance:** the facts strip becomes four frosted cards over a soft glow, with the same four true claims.
- **How it works:** the steps become a scroll-driven timeline. The steps (and on wide screens a decorative scene) stay pinned while the visitor scrolls; their own scrolling advances step 1 to 3, only the active step shows its line, and the page moves on once every step has been shown.
- **BREAKING: deck creation requires an account.** The idea form moves to `/new`, which only signed-in people can use. Creating a deck and retrying a failed deck check the session on the server. Signed-out visitors are sent to sign in and brought back to `/new` afterwards.
- **Return after sign-in:** sign-in and sign-up honour a `next` value, but only for an allowlisted path (`/new`); anything else returns to the home page.
- **Design direction:** the "restrained" rule is replaced by a motion and surface standard: soft glows, gradient accents, frosted surfaces and scroll-driven storytelling are allowed, using design tokens, a single easing curve, and reduced-motion support.
- **FAQ fix (not yet done):** "Who can see my deck?" still says there are no accounts; it must say that accounts exist but deck links are still public share links.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `marketing-home`: the hero no longer holds the idea form; the "restrained design" rule is replaced by a motion and surface standard; How it works becomes a pinned, scroll-driven timeline.
- `site-shell`: the header shows the wordmark only, becomes a floating bar on scroll, and "Create a deck" goes to `/new`.
- `deck-submission`: submitting an idea requires sign-in, on a dedicated `/new` page, checked on the server.
- `deck-viewing`: trying again on a failed deck requires sign-in, checked on the server.
- `user-auth`: after signing in or up, people return to an allowlisted page they were sent from; signed-in people opening a sign-in link that carries `next` see the form instead of being redirected.

## Impact

- **Routes:** new `/new` (partially prerendered: static shell, form streamed after a server-side session check). `/` stays static.
- **Code:** `app/_components/home/*` (hero, hero preview, facts, how it works), `app/new/page.tsx`, `app/_components/idea-form.tsx`, `components/site/*` (header bar, header, nav links, mobile nav, account menu), `components/brand/logo.tsx`, `components/theme/theme-menu.tsx`, `app/globals.css` (motion tokens, `short` breakpoint), `proxy.ts`, `src/auth/session.ts`, `src/auth/redirect.ts`, `src/decks/actions.ts`, the sign-in and sign-up forms, `README.md`.
- **Security:** deck creation and retry are now authorised on the server; the post-sign-in redirect is limited to an allowlist. Decks are still not owned by accounts, and deck links stay public (ownership is the planned `add-my-decks` change).
- **Dependencies:** none added. Two free Pikaicons (`pencil-edit`, `sparkle-ai-01`) were generated into `src/components/icons`.
