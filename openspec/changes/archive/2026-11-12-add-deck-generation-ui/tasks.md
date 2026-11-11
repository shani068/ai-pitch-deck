# Tasks

Verification note: run `vp check` where a task says so. If it fails with
`Detected cycle while resolving name 'configDefaults'` (the known vite-plus issue in the README),
use `vp exec tsc --noEmit` plus `vp lint` instead, and say so in the task summary.

## 1. UI components and configuration

- [x] 1.1 Add the shadcn components `button textarea field card alert skeleton spinner badge` with
      `vp dlx shadcn@latest add ...`. Verify that the files exist under `components/ui/` and that
      `git diff package.json bun.lock` is empty. If either changed, stop and ask before going on.
- [x] 1.2 Add `images.remotePatterns` for `https://picsum.photos/seed/**` and `https://ik.imagekit.io`
      to `next.config.ts` (design D6). Leave the CSP and the other headers unchanged. Verify with
      `vp check`, and by reading the diff: only the `images` key was added.
- [x] 1.3 Replace the starter metadata in `app/layout.tsx` with the app's title template
      ("%s · AI Pitch Deck", default "AI Pitch Deck") and a one-line description, and add a simple
      header that links the app name to `/`. Verify with `vp check`, and with `vp run dev`: the tab
      title and the header show on `/`.

## 2. Deck domain module (`src/decks/`)

- [x] 2.1 Create `src/decks/validation.ts` with `IdeaSchema` (string, trimmed, 20..2000, with the
      user-facing messages from the deck-submission spec, Zod v4 `error` param) and `DeckIdSchema`
      (`z.cuid2()`). Add a comment naming the matching limits in `src/ai/pitch-deck/`. Add
      `src/decks/validation.test.ts` covering: 19 and 20 characters after trimming, 2,000 and
      2,001, surrounding whitespace trimmed, non-string input rejected, valid and invalid cuid2.
      Verify with `vp test`.
- [x] 2.2 Create `src/decks/polling.ts` with a pure `pollPlan(status, createdAt, now)` that returns
      `done | poll (refreshInMs 3000) | stale` and exports the 10-minute threshold (design D4).
      Add `src/decks/polling.test.ts` covering each status, an age just under and at 10 minutes,
      and `COMPLETE`/`FAILED` never polling. Verify with `vp test`.
- [x] 2.3 Create `src/decks/queries.ts` (`server-only`) with `getDeckForView(id)`. It selects
      only `id, title, status, errorMessage, createdAt` and the slides
      (`order, title, content, imagePrompt, imageUrl`) ordered by `order`, never `idea`, and
      returns `null` for an unknown id. Use the prisma-8 skill for the query API. Verify with
      `vp check`, and by reading the select lists: `idea` does not appear.
- [x] 2.4 Create `src/decks/start-generation.ts` (`server-only`) with `createAndStartDeck(idea)`:
      insert a `PENDING` deck, send `deckGenerate` for its id, delete the deck and return a
      generic failure if the send throws, and log on the server without the idea (design D2). If
      the insert fails, return the same failure without sending. Verify with `vp check`, and with
      the fault check in 5.4.
- [x] 2.5 Create `src/decks/actions.ts` (`"use server"`) with `createDeck(prevState, formData)` and
      `retryDeck(deckId, prevState)` that return the `FormState` union from design D3.
      `createDeck` validates with `IdeaSchema` and returns the message plus the submitted text on
      failure. `retryDeck` validates the id with `DeckIdSchema`, loads the deck and proceeds only
      when it is `FAILED`. Both call `redirect("/decks/" + id)` after the try/catch on success.
      Verify with `vp check`, and by reading the file: no thrown error reaches the client, the idea
      is never returned by `retryDeck`, and redirects are relative.

## 3. Home page and idea form

- [ ] 3.1 Replace `app/page.tsx` with the home layout (headline, short explanation, `<IdeaForm>`)
      using semantic tokens only (design D8). Delete nothing outside the starter markup. Verify
      with `vp run dev`: `/` shows the form in both light and dark OS themes, with no horizontal
      scroll at 375px width.
- [ ] 3.2 Create `app/_components/idea-form.tsx` (`"use client"`) using `useActionState(createDeck)`.
      Add a `field`-wrapped textarea with `name="idea"`, `minLength`/`maxLength` from the shared
      limits, a live `n / 2000` count, the error tied to the field (`aria-invalid`,
      `aria-describedby`), `defaultValue` from the returned state so the text survives a
      rejection, and a submit button that is disabled with a spinner while pending. Verify with
      `vp run dev`: - a 10-character idea shows the minimum-length message and keeps the text; - submitting the same short idea with the `minLength` attribute removed in devtools is still
      rejected by the server, and no deck row appears; - a double click creates one deck.

## 4. Deck page

- [x] 4.1 Create `app/decks/[id]/page.tsx` with static metadata (`title: "Pitch deck"`,
      `robots: { index: false, follow: false }`), and render `<DeckView>` inside `<Suspense>` with
      a skeleton fallback. Create `app/decks/[id]/not-found.tsx` with a link home. Verify with
      `vp run build`: the build succeeds without a database connection and lists `/decks/[id]`.
      Then with `vp run dev`: `/decks/not-a-cuid` and a valid but unknown cuid2 both show the
      not-found UI.
- [x] 4.2 Create `app/decks/[id]/_components/deck-view.tsx` (server). Await `params`, validate
      with `DeckIdSchema` (call `notFound()` before any query when invalid), call
      `await connection()`, load with `getDeckForView`, compute `pollPlan` after the query, and
      render the pending, generating, stale, failed or complete view with a status `badge` and an
      `aria-live="polite"` status line (design D8). Render `errorMessage` as text only, with a
      generic fallback when it is empty. Verify with `vp check`, and with `vp run dev` against
      decks set to each status (for example in the Neon SQL editor): each shows the matching view,
      and the page source does not contain the idea text.
- [ ] 4.3 Create `app/decks/[id]/_components/deck-status-poller.tsx` (`"use client"`). It runs one
      `setTimeout` per render that calls `router.refresh()`, skips refreshes while the tab is
      hidden, refreshes when the tab becomes visible, and clears its timer on unmount. Add a
      "Check again" button for the stale view that calls `router.refresh()` once. Verify with
      `vp run dev`: - changing a `PENDING` deck to `COMPLETE` in the database updates the open page within 10
      seconds; - the network tab shows no further refreshes after that; - a deck with `createdAt` more than 10 minutes ago shows the stale notice and does not keep
      refreshing.
- [x] 4.4 Create `app/decks/[id]/_components/slide-card.tsx`. Show the slide number, title and
      content, plus `next/image` (1024x1024, responsive `sizes`, `alt` = `imagePrompt`, `priority`
      only for the first slide), rendered only when `imageUrl` passes the https and allowed-host
      check from design D6. Otherwise render no image. Verify with `vp run dev`: - a deck with Picsum URLs shows its images, the browser console reports no CSP violation,
      and the image requests go to `/_next/image`; - a slide whose `imageUrl` is null or `https://example.com/x.png` renders without an image
      and without an error.
- [x] 4.5 Create `app/decks/[id]/_components/retry-form.tsx` (`"use client"`) using
      `useActionState(retryDeck.bind(null, deckId))`, a "Try again" button with a pending state,
      a "Start over" link to `/`, and the generic error from the action state. Verify with
      `vp run dev` on a `FAILED` deck: "Try again" goes to a new deck id, the new deck is `PENDING`
      with the same idea, and the failed deck's status and message are unchanged.

## 5. Workflow flow control and end-to-end checks

- [x] 5.1 Add `concurrency: { limit: 3 }` and `throttle: { limit: 30, period: "1h" }` to the
      `generate-deck` function options next to `idempotency`, with a short comment explaining why
      `rateLimit` is not used (design D7). Leave the steps and `onFailure` unchanged. Verify with
      `vp check`, by reading the diff (only the options object changed), and in the Inngest dev
      server UI: the function's configuration shows both limits.
- [ ] 5.2 End to end, placeholder mode: run `vp run dev` and the Inngest dev server, submit a
      valid idea on `/`, and watch the deck page. Verify: it moves from queued to generating to
      complete without a reload, shows 5 to 8 slides with images, and the run in the Inngest UI
      completed.
- [x] 5.3 End to end, failure and retry: temporarily make content generation fail without
      retrying (for example, temporarily raise the evaluator's approval bar in a local edit), then
      submit an idea. Verify that the page shows the rejection message and "Try again", and that
      retrying starts a new deck. Revert the edit and confirm `git diff` no longer contains it.
- [x] 5.4 Fault check, start failure: temporarily make `inngest.send` throw (local edit), then
      submit a valid idea. Verify that the form shows the generic "could not start" message, keeps
      the text, and that no new `PENDING` deck row remains. Revert and confirm `git diff` is clean
      of the edit.
- [x] 5.5 Update the README's Usage section (it still describes the old Users/Posts starter) to
      describe the idea -> deck flow, explain that decks stay pending without the Inngest dev
      server, and note that deck links are public share links. Verify by following the README
      steps from a fresh `vp run dev`.
- [x] 5.6 Run `vp check`, `vp test` and `vp run build`, and confirm that all three pass. Then
      record in the change summary how the OWASP risks were handled: XSS (JSX only, no
      `dangerouslySetInnerHTML`, allowed image hosts), input validation (Zod on every action and
      on the route param), CSRF (Server Action Origin check, no GET mutations), open redirects
      (relative paths only), secrets (none in client modules), information exposure (no idea on
      the page, generic errors, `noindex`) and abuse (Inngest flow control, OpenAI spending limit
      recommended).

## Workflow follow-up

- Recommend setting a monthly spending limit on the OpenAI project used by `OPENAI_API_KEY`. This
  is an account setting, not code.
- Archive the change with `/opsx:archive` after review.
