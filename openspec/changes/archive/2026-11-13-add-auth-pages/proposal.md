# Proposal

## Why

The product has no accounts, so it cannot show visitors their own decks or keep a deck private. This change adds the account layer: a visitor can create an account, sign in and sign out with email and password. The next change (`add-my-decks`) builds on it: deck ownership, sign-in-required generation, owner-only deck pages and a "My decks" dashboard. The user also wants the whole app set in Inter.

## What Changes

- **Better Auth on the server.**
  - Email and password only: no social providers and no email sending.
  - Mounted at `/api/auth/*`.
  - Uses the existing Neon database through a `pg` pool on the direct connection URL.
  - Sessions live in an HttpOnly cookie for 7 days, with a short signed cookie cache to limit database reads.
  - Sign-in and sign-up are rate-limited, with the counters stored in the database.
- **Auth tables in the Prisma contract.** `user`, `session`, `account`, `verification` and `rateLimit` are declared in `src/prisma/contract.prisma`, matching Better Auth's 1.7 schema. The contract stays the single source of truth, and a development database is brought up to date with `prisma db update`. Better Auth's own `migrate` command is not used.
- **Pages:**
  - `/sign-up` ("Create your account") and `/sign-in` ("Welcome back") reproduce the provided design: a page with faint grid lines and "+" marks where they cross, a centred title and subtitle, a bordered card with icon-prefixed inputs, a show/hide password toggle, an outlined full-width submit button, and a switch link below the card ("Already have an account? Sign in").
  - The GitHub button and "or with email" divider are left out.
  - The "Terms and Privacy Policy" line is left out because those pages don't exist.
  - The sign-up subtitle drops "No credit card required." because the product has no payments.
- **Validation:** Zod in the forms for immediate feedback, and again on the server: Better Auth's password length rules plus a server hook that validates and trims the name. Errors are clear but never reveal internal details.
- **Header:**
  - A "Sign in" link when signed out.
  - When signed in, a menu with the person's name and email and "Sign out".
  - The mobile menu mirrors both states.
  - The session is read in the browser, so `/` and the deck pages stay prerendered and the home page render makes no database query.
- **Signed-in visitors** who open `/sign-in` or `/sign-up` are redirected home by `proxy.ts`. This is an optimistic cookie check for convenience only, not an access-control check.
- **Typography: BREAKING for the design-system font rule.** Inter (self-hosted through `next/font`) replaces Outfit for headings and Geist for body text. Monospace labels use the system monospace stack, and Geist is removed.

Out of scope, all for the next change: deck ownership, requiring sign-in to generate, owner-only deck pages, the "My decks" dashboard, password reset, email verification, social sign-in and account deletion.

## Capabilities

### New Capabilities

- `user-auth`: creating an account, signing in and out with email and password, the session cookie, rate limiting, the auth pages and the error messages they show.

### Modified Capabilities

- `design-system`: the typography requirement changes from "Geist body, Outfit headings" to Inter throughout.
- `site-shell`: the header gains the visitor's account state ("Sign in", or a menu with their name and "Sign out"), including in the mobile menu.

## Impact

- **Dependencies (approved earlier in planning):**
  - `better-auth` pinned to `1.7.14`, released 2026-10-26; the newer 1.7.21 is a day old.
  - `pg` `8.22.0`, already installed transitively by Prisma and now imported directly, plus `@types/pg` as a dev dependency.
  - No UI or theme library.
- **Code:**
  - `src/prisma/contract.prisma` (auth models) and the regenerated contract artefacts.
  - New `src/auth/*`: the server instance, the browser client and shared validation.
  - New route handler `app/api/auth/[...all]/route.ts`.
  - New pages `app/(auth)/sign-in` and `sign-up`, with a shared auth layout and form components.
  - New `proxy.ts`.
  - `components/site/*` (account controls), `app/layout.tsx` and `app/globals.css` (Inter).
  - New Pikaicons (user, mail, lock, eye, eye-off, logout).
- **Database:** five new tables in the development database through `prisma db update`. This is additive and changes no existing table.
- **Environment:** new `BETTER_AUTH_SECRET` (at least 32 random characters) and `BETTER_AUTH_URL`, documented in `.env.example`. The secret never goes in client code, logs or the repo.
- **Prerequisite:** archive `redesign-brand-and-theme` first. It still has 2 open checks (the browser review and `vp run build`). This change modifies requirements that change adds to `design-system` and `site-shell`.
- **Security:**
  - Passwords are hashed by Better Auth.
  - Session cookies are HttpOnly, SameSite=Lax, and Secure in production.
  - Better Auth checks the origin and CSRF on its endpoints.
  - Auth endpoints are rate-limited.
  - The `/sign-in` redirect in the proxy is UX only; authorization stays on the server.
