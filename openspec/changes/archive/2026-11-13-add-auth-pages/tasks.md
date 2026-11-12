# Tasks

Verification notes:

- `vp check` and `vp test` run after each group. If the known vite-plus `configDefaults` cycle appears, use `vp exec tsc --noEmit` plus `vp lint` and say so.
- If `vp run build` fails at `prisma contract emit` with `EPERM` on `src/prisma/contract.d.ts` (the Windows file lock seen before), close the program holding the file and retry. Report it rather than skip it.
- Checks marked **(browser)** need a person in a real browser and are reported as open, not ticked.

## 1. Prerequisites and dependencies

- [x] 1.1 Confirm that `redesign-brand-and-theme` has been archived: `openspec/specs/site-shell/spec.md` exists and `openspec/changes/redesign-brand-and-theme/` is gone. If it has not, stop and ask.
- [x] 1.2 Add `better-auth@1.7.14` (exact) and `pg@8.22.0`, and `@types/pg` as a dev dependency, with `vp add`. Verify with `git diff package.json`: these are the only added entries, and `vp why pg` shows the direct dependency.
- [x] 1.3 Add `BETTER_AUTH_SECRET` (generated locally with `openssl rand -base64 32`, never printed or logged) and `BETTER_AUTH_URL=http://localhost:3000` to `.env`. Document both in `.env.example` with placeholder values. Verify that `.env` holds both keys with `grep -c`, that `git status` does not list `.env`, and that `.env.example` has no real secret.

## 2. Schema

- [x] 2.1 Add the `User`, `Session`, `Account`, `Verification` and `RateLimit` models to `src/prisma/contract.prisma` (design D1), with `@@map("user")`, `@@map("session")`, `@@map("account")`, `@@map("verification")` and `@@map("rateLimit")`. Use Better Auth's field names, `String @id` with no generator, cascading foreign keys, the unique and indexed columns, and `lastRequest BigInt`. Use the prisma-8 skill for the syntax. Verify with `vp run contract:emit`, and by reading `contract.json`: the five table names and their columns match the schema in design D1.
- [x] 2.2 Apply the tables to the development database with `vp exec prisma db update`, which is additive and never resets. Then run `vp exec prisma db verify`. Verify that the update lists only new tables and indexes, and that `db verify` passes.

## 3. Server and client auth modules

- [x] 3.1 Create `src/auth/validation.ts` (no `server-only`) with `NameSchema` (trimmed, 1 to 100), `EmailSchema` (`z.email()`, lower-cased), `PasswordSchema` (8 to 128), `SignUpSchema` and `SignInSchema`, each with user-facing messages. Add `src/auth/validation.test.ts` for the boundary cases (empty or 100/101-character names, 7/8/128/129-character passwords, invalid email, case folding). Verify with `vp test`.
- [x] 3.2 Create `src/auth/server.ts` (`server-only`) with the `betterAuth` instance from design D1: - the `pg` Pool on `directConnectionUrl()`; - email and password options; - session and cookie cache; - database rate-limit storage with custom rules; - the `user.create.before` name hook using `NameSchema`; - `nextCookies()` last.

      Create `app/api/auth/[...all]/route.ts` exporting `toNextJsHandler(auth)`. Verify with `vp check`, and with `curl http://localhost:3000/api/auth/ok` returning `{"status":"ok"}`.

- [x] 3.3 Create `src/auth/client.ts` (`createAuthClient` from `better-auth/react`) and `src/auth/errors.ts` (design D3 mapping), and add `src/auth/errors.test.ts` covering each mapped code, status 429 and an unknown code. Verify with `vp test`.
- [x] 3.4 Server checks with `curl` against `/api/auth/*`: - sign-up with valid data returns 200 and sets an HttpOnly session cookie; - signing up again with the same email (different case) is refused; - a 7-character password and a 101-character name are refused with no `user` row created; - sign-in with a wrong password returns the invalid-credentials code; - sign-out deletes the `session` row.

      Remove the test accounts afterwards. Verify by recording each status code and the database counts in the task summary.

## 4. Typography

- [x] 4.1 Switch to Inter (design D7): load `Inter` in `app/layout.tsx` and remove Geist, Geist Mono and Outfit. Set `--font-sans` and `--font-heading` to `var(--font-inter)`, and `--font-mono` to the system monospace stack, in `app/globals.css`. Verify with `vp check`, and with `curl` of `/`: the stylesheets reference only `/_next/static/media/*.woff2` font files and contain an `Inter` `@font-face`, with no Geist or Outfit.

## 5. Auth pages

- [x] 5.1 Add the shadcn `input` component (`vp dlx shadcn@latest add input`). Check that `package.json` is unchanged and swap any lucide import. Add free Pikaicons for user, mail, lock, eye, eye-off and logout with `vp dlx pikaicons search` and `add`. Verify that the files exist and `rg "lucide" app components src` is empty.
- [x] 5.2 Create `app/(auth)/layout.tsx` with the grid-frame shell (design D5): vertical and horizontal border lines and four CSS "+" marks, using tokens only. Create `_components/auth-card.tsx`, `icon-input.tsx` and `password-input.tsx` (eye toggle with `aria-label` "Show password" / "Hide password" and `aria-pressed`). Verify with `vp check`.
- [x] 5.3 Create `sign-up-form.tsx` and `app/(auth)/sign-up/page.tsx`: "Create your account", subtitle "Get started in less than a minute.", fields Full name, Email address and Password (8+ characters), and an outlined full-width "Create account" button with a pending state. Zod field errors, the mapped server errors, and on success `router.push("/")` plus `refresh()`. Below the card: "Already have an account? Sign in". Verify with `vp check`, and with `curl` of `/sign-up`: the title, three labelled inputs, the button and the link are present, with no "GitHub", "Terms" or "Privacy".
- [x] 5.4 Create `sign-in-form.tsx` and `app/(auth)/sign-in/page.tsx`: "Welcome back", subtitle "Sign in to pick up where you left off.", Email address and Password, an outlined "Sign in" button, and "Don't have an account? Create one". Verify with `vp check` and `curl` of `/sign-in` as in 5.3.
- [x] 5.5 Create `proxy.ts` (design D6) with matcher `["/sign-in", "/sign-up"]`. Verify with `curl`: `/sign-in` with no cookie returns 200, and with a session cookie from 3.4 returns a redirect to `/`.

## 6. Header account state

- [x] 6.1 Create `components/site/account-menu.tsx` (design D4): a fixed-size placeholder while pending, a "Sign in" link when signed out, and when signed in an initials button with an accessible name, opening a menu with name, email and "Sign out". Wire it into `SiteHeader` next to the theme menu. Extend `MobileNav` with "Sign in" / "Sign out". Verify with `vp check`. The signed-in states are checked in 7.3 **(browser)**.
- [x] 6.2 Update the README: environment variables (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`), the Usage section (create an account, sign in, sign out), the project structure (`src/auth`, `app/(auth)`, `proxy.ts`), and the known limits (no password reset or email verification yet). Verify by reading the rendered Markdown.

## 7. Integration checks

- [x] 7.1 Run `vp check`, `vp test` and `vp run build`, and confirm all pass. The route table must still show `/` as static (`○`), with `/sign-in` and `/sign-up` present.
- [x] 7.2 Confirm with `curl` that rendering `/` makes no `/api/auth` or database call. The dev server log for one `GET /` shows no auth or Prisma activity, and the HTML includes the "Sign in" placeholder slot.
- [x] 7.3 **(browser)** In light and dark at 375 and 1280 px, compare `/sign-up` and `/sign-in` with the reference screenshot: - grid frame, card, icon inputs, eye toggle and outlined button; - create an account, see the account menu, sign out, sign in again; - a wrong password shows "Invalid email or password."; - opening `/sign-in` while signed in lands on `/`; - keyboard-only use works.

      Record the results. Done 2026-11-13: checked manually in the browser by the project owner. 7.1: `vp check` 0 errors, `vp test` 84 passed, `vp run build` passed with `/` static (○) and `/sign-in`, `/sign-up` present.

- [x] 7.4 State the security handling in the task summary: - hashing by Better Auth; - HttpOnly, SameSite=Lax and Secure-in-production cookies; - the origin and CSRF checks on `/api/auth`; - database-backed rate limits; - the server-side name and password rules; - the secret kept in `.env` only; - the optimistic-only proxy redirect; - no account enumeration on sign-in.

## Workflow follow-up

- Archive this change with `/opsx:archive` after review.
- Next change: `add-my-decks` (deck ownership with `Deck.userId`, sign-in-required generation, owner-only deck pages, a "My decks" dashboard, and an updated FAQ answer about who can see a deck).
