# Design

## Context

See proposal.md for the motivation. This design records how the redesign and the sign-in gate were built, so the archived change explains its decisions.

Constraints that shaped it:

- Next.js with `cacheComponents` (Partial Prerendering): a request-time read such as the session must sit behind a `<Suspense>` boundary, and the home page must stay a static page.
- No new dependencies without approval, Pikaicons only, design tokens only, Tailwind v4 configured in `app/globals.css`.
- Better Auth already provides the session (signed cookie, server validation) and a `proxy.ts` that redirects only on the presence of a cookie.

## Goals / Non-Goals

**Goals:**

- Authorise deck creation and retry on the server, not only in the UI.
- Keep `/` static and free of session reads; keep `/new`'s shell static.
- Deliver the Apple-style motion without a motion library, with reduced-motion support.

**Non-Goals:**

- Deck ownership (`Deck.userId`), owner-only deck pages and a "My decks" list: the planned `add-my-decks` change.
- A general-purpose redirect after sign-in: only `/new` is supported.

## Decisions

### D1. The gate lives on the server, in two places

`src/auth/session.ts` (server-only) wraps Better Auth's `getSession` with the request headers. It is called:

- by `/new`, inside a `<Suspense>` boundary, so the page shell (heading and copy) still prerenders and the form streams in after the check. With no session it calls `redirect("/sign-in?next=/new")`;
- at the top of `createDeck` and `retryDeck`, which return "Please sign in to create a pitch deck." without touching the database or Inngest.

`proxy.ts` adds a cookie-only redirect for `/new` to `/sign-in?next=/new`. It only saves a round trip and is documented as never being access control.

_Alternative:_ keep the form in the hero and hide it for signed-out visitors. Rejected: the home page would read the session on every request and stop being static, and hiding the form alone would not authorise anything.

### D2. The return path is an exact allowlist

`safeNextPath` (`src/auth/redirect.ts`) returns `next` only when it is exactly one of the allowlisted paths (`/new`), else `/`. The sign-in and sign-up forms read `next` from `window.location` when they submit, which avoids `useSearchParams` and its Suspense requirement on static pages. Unit tests cover protocol-relative, absolute, backslash and query-string variants.

_Alternative:_ accept any same-origin relative path. Rejected: path parsing edge cases (`//host`, `/\host`) are the usual source of open redirects, and only one return path is needed.

### D3. Sign-in links carrying `next` are not bounced by the proxy

A cookie can outlive its session (signed out elsewhere, expired on the server). Then `/new` (cookie present) fails the server check and redirects to `/sign-in?next=/new`, and a proxy that bounced every cookie-holder away from `/sign-in` would send them back to `/new`, in a loop. The proxy therefore only redirects cookie-holders away from the auth pages when there is no `next`. Only the `/new` redirects add `next`, and showing the form to a signed-in person who opens such a link is harmless.

### D4. Header bar state from scroll position

`HeaderBar` is a small client component that reads `window.scrollY > 8` through `useSyncExternalStore` (server snapshot: not scrolled) and sets `data-scrolled`. Every visual change is a CSS transition keyed on that attribute, so the rest of the header stays a Server Component.

### D5. Motion tokens in CSS

`app/globals.css` defines `--ease-apple` (`cubic-bezier(0.16, 1, 0.3, 1)`) and the `rise`, `settle` and `typing` keyframes as Tailwind `@theme` animations. Hover lifts transition `translate` and `scale` explicitly: Tailwind v4's translate and scale utilities set those CSS properties, not `transform`, so a `transition-[transform]` list would snap. The existing global reduced-motion rule shortens every animation and transition.

### D6. How it works: pinned track, scroll-linked units

The steps sit in a sticky box inside a tall track (`100svh − header + 3.4 × 70svh`). Scroll distance through the track is measured in units (one per step plus a 0.4 hold); within a unit, the first 70 % fills the step's line and the rest holds the step. The shown position glides towards the scroll position (18 % per frame), giving smooth, Apple-like motion. On narrow screens only the step list is pinned and the scene sits above it, because both do not fit; a `short:` breakpoint (`max-height: 44rem`) tightens spacing so the list fits on small phones.

To stop fast scrolls skipping steps, the visitor's own scrolling (wheel, touch or scroll keys within the last 1.5 s) that would pass a step's "fully shown" point before that step has been on screen for 450 ms rests the page there for 450 ms. Link and button scrolls, Home and End, and reduced motion are never held.

_Alternatives considered:_

- **Timed autoplay with a scroll lock** (built first). Rejected by the product owner: the animation should follow the visitor's scrolling, not a clock.
- **CSS scroll snapping** (`scroll-snap-stop: always` markers). Rejected after testing: with ordinary 100 px mouse-wheel ticks, proximity snapping pulled the page back to the nearest stop after every tick, so the timeline could not get past step 1.
- **The `motion` library** (`useScroll`). Not needed: native scroll events read once per animation frame cover it, and a dependency needs approval.

### D7. Decorative scenes are built from tokens and the sample deck

The hero preview and the How it works scene use `SAMPLE_DECK` and token colours only: no images, no remote requests, and `aria-hidden`, since the visible text carries the meaning. The hero preview steps through the sample slides once, pauses while hovered or focused (checked with `:hover, :focus-within` when its timer fires), stops when a slide is picked, and does not move with reduced motion.

## Risks / Trade-offs

- [Scroll handling is custom code that browsers may treat differently] → Tested in Chrome with wheel and touch input at 1280 × 860, 375 × 812 and 375 × 667. Safari and Firefox should be checked by hand before a release.
- [The resting hold on fast scrolls is a mild form of scroll-jacking] → It applies only to the visitor's own fast scrolling, lasts at most 450 ms per step, and never applies to links, buttons, Home/End or reduced motion.
- [The dev server's Tailwind build picked up new classes only after `app/globals.css` changed] → A development-only quirk; production builds are complete. Restart `vp run dev` if new classes look unstyled.
- [Decks are still public share links and not owned by accounts] → Documented in the README and FAQ; ownership is `add-my-decks`.

## Migration Plan

No data migration. Deploying the code is enough. Signed-out visitors who used to create decks from the home page now sign in first. Rollback is a code revert; no stored data depends on the change.
