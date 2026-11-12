# Tasks

Most of this work is already built. Tasks 1.4 (the "Start over" link) and 5.1 (the FAQ answer) are not; everything else needs only its verification re-run before it is ticked.

## 1. Sign-in gate for deck creation

- [x] 1.1 Add `src/auth/session.ts` (`server-only`, Better Auth `getSession` with the request headers) and check it first in `createDeck` and `retryDeck`, returning "Please sign in to create a pitch deck." (design D1). Verify with `vp check`, and by reading both actions: the check runs before validation, database access or Inngest.
- [x] 1.2 Add `safeNextPath` in `src/auth/redirect.ts` with `src/auth/redirect.test.ts`, and use it in the sign-in and sign-up forms (design D2). Verify with `vp test`: `/new` is allowed, and `//evil.example`, `https://evil.example/new`, `/\evil.example`, `/new?x=1`, `/decks/abc` and empty values fall back to `/`.
- [x] 1.3 Add `app/new/page.tsx` (static heading, form in `<Suspense>` after the server-side session check, `noindex`) and extend `proxy.ts` to `/new` without bouncing sign-in links that carry `next` (design D1, D3). Verify with `curl`: `/new` without a cookie returns 307 to `/sign-in?next=%2Fnew`; `/new` with an invalid cookie returns no `id="idea"` field and streams a redirect to `/sign-in?next=/new`; `/sign-in?next=/new` with a cookie returns 200; `/sign-in` with a cookie and no `next` redirects to `/`.
- [x] 1.4 Point every "Create a deck" action at `/new` (`CREATE_DECK_HREF`, closing call to action, deck not-found page), remove the `#create` focus handling from the idea form (it focuses its field on mount instead), and change the failed deck's "Start over" link in `app/decks/[id]/_components/retry-form.tsx` from `/` to `/new`. Verify with `rg '#create' app components` returning nothing, and `rg 'href="/"' app/decks` returning nothing.
- [x] 1.5 Update the README: the Usage steps (sign in, then create a deck at `/new`), the project structure (`app/new/`), the proxy description and the Accounts paragraph. Verify by reading the rendered Markdown.

## 2. Header

- [x] 2.1 Show the wordmark alone in the header (`Wordmark` in `components/brand/logo.tsx`), add `components/site/header-bar.tsx` (see-through at the top, rounded blurred bar once scrolled, design D4), soft hover backgrounds on section links, round controls, and the dark "Create a deck" pill. Verify in a browser at 1280 and 375 px in light and dark: the bar has no background at the top, fades in after scrolling and out again at the top, and the page does not scroll sideways.

## 3. Hero

- [x] 3.1 Rebuild the hero (`hero.tsx`, `hero-preview.tsx`) with the eyebrow, headline, actions to `/new` and `/#example`, and the decorative sample-deck preview; add the motion tokens to `app/globals.css` (design D5, D7); delete the unused `slide-stack.tsx`. Verify with `vp run build` that `/` is still static (`○`), that the built home page has no idea form, and in a browser that hover lifts animate over time (sampled mid-transition) and the headline keeps "investor-ready" whole from 375 to 1536 px.

## 4. At a glance and How it works

- [x] 4.1 Restyle the facts strip as four frosted cards over a soft glow, keeping the same four claims. Verify in a browser at 1280 px (light and dark) and 375 px: two columns on phones, no horizontal scroll, no hard edge where the glow ends.
- [x] 4.2 Build the pinned, scroll-driven How it works timeline (`how-it-works-steps.tsx`, design D6) and add the `short:` breakpoint. Verify in Chrome with wheel input at 1280 × 860 and touch input at 375 × 812 and 375 × 667: the step list stays pinned and fully visible, steps advance 1 → 3 with scrolling and rewind when scrolling up, only the active step shows its line, a fast scroll rests on each step, the section releases after step 3, and header links to Features and Example are not held.

## 5. Content accuracy

- [x] 5.1 Update the FAQ answer to "Who can see my deck?" in `app/_components/home/faq.tsx`: accounts now exist and creating a deck needs one, but decks are not yet owned by accounts and anyone with a deck's link can view it. Verify by reading the rendered FAQ: it no longer says there are no accounts, and it still says deck links are public and hidden from search engines.

## 6. Integration checks

- [x] 6.1 Run `vp check`, `vp test` and `vp run build`. Verify that all pass, `/` is static (`○`), `/new` is partially prerendered (`◐`), and `/sign-in` and `/sign-up` are listed. Done 2026-11-13: `vp check` 0 errors, `vp test` 84 passed. `vp run build` stopped at `prisma contract emit` (Windows EPERM file lock on `src/prisma/contract.d.ts`; the contract source was unchanged), so `next build` was run on its own and passed with `/` static (○), `/new` partially prerendered (◐), `/sign-in` and `/sign-up` listed. Accepted by the project owner.
- [x] 6.2 **(browser)** Sign in, open "Create a deck", generate a deck, and repeat while signed out (sign-in first, then back to `/new`). Check the header, hero and How it works scrolling in Safari or Firefox as well as Chrome. Record the results. Done 2026-11-13: confirmed by the project owner from their manual testing.
- [x] 6.3 State the security handling in the task summary: server-side session checks on `/new`, `createDeck` and `retryDeck`; the exact-match return-path allowlist; the cookie-only proxy redirects as a convenience; no stale-cookie redirect loop; deck links still public until `add-my-decks`.

## Workflow follow-up

- Archive this change with `/opsx:archive` after review, syncing its spec deltas.
- Next change: `add-my-decks` (deck ownership with `Deck.userId`, owner-only deck pages, a "My decks" dashboard, and an updated FAQ answer about who can see a deck).
