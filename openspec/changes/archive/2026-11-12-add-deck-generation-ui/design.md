# Design

## Context

See proposal.md for motivation. Current state that shapes the approach:

- **Backend.** Generation runs only inside the `generate-deck` Inngest function
  (`inngest/functions/generate-deck.ts`), triggered by a `deck/generate` event
  `{ deckId: cuid2 }` (`inngest/client.ts`). It moves a deck `PENDING -> GENERATING -> COMPLETE`,
  or to `FAILED` with a message that is safe to show users. It saves the title, the slides and
  `COMPLETE` in one transaction. Its `idempotency: "event.data.deckId"` ignores repeat events for a
  deck for 24 hours. Nothing creates decks or sends the event yet.
- **Data.** `Deck { id, idea, title?, status, errorMessage?, createdAt, updatedAt }` and
  `Slide { deckId, order, title, content, imagePrompt, imageUrl? }` (`src/prisma/contract.prisma`).
  `db` is server-only (`src/prisma/db.ts`). There are no users and no owner column.
- **Framework.** Next.js 16 with `cacheComponents: true`: request-time data must be read inside a
  `<Suspense>` boundary, and `params` is a promise. Server Actions already compare `Origin` with
  `Host`.
- **Security headers.** The static CSP in `next.config.ts` has `img-src 'self' blob: data:`, which
  blocks direct `<img>` loads from `picsum.photos` (which redirects to `fastly.picsum.photos`) and
  `ik.imagekit.io`.
- **UI.** shadcn is configured (`radix-nova`, `@/components/ui`) but no component is installed yet.
  Tokens live in `app/globals.css`, and dark mode follows the OS. `app/page.tsx` is the starter page.
- **Tests.** The project has no test files yet. `vp test` runs Vitest.

## Goals / Non-Goals

**Goals:**

- One end-to-end flow (idea -> pending deck -> live status -> finished deck or failure) with no
  new npm dependency and no schema change.
- All validation and state changes on the server. The browser only decides when to re-fetch.
- Reuse the existing workflow unchanged apart from flow-control options.

**Non-Goals:**

- Changing `src/ai/pitch-deck/` or the workflow steps.
- Showing per-slide progress during generation. The status column is the only progress signal,
  and adding more would need a schema change.
- Push updates (Inngest realtime or SSE).

## Decisions

### D1. Module layout: `app/` for routes, `src/decks/` for deck logic

```
app/
  layout.tsx                  metadata + header (title template, app name)
  page.tsx                    home: hero copy + <IdeaForm>
  _components/idea-form.tsx   "use client": useActionState(createDeck)
  decks/[id]/
    page.tsx                  static shell + <Suspense fallback={<DeckSkeleton/>}><DeckView/></Suspense>
    not-found.tsx             "deck not found" + link home
    _components/
      deck-view.tsx           server: reads deck, picks the status view
      deck-status-poller.tsx  "use client": router.refresh() loop, "check again"
      retry-form.tsx          "use client": useActionState(retryDeck)
      slide-card.tsx          one slide (next/image + title + content)
components/ui/*               shadcn (generated)
src/decks/
  validation.ts               Zod: IdeaSchema (20..2000, trimmed), DeckIdSchema (z.cuid2()); no server-only
  polling.ts                  pure: pollPlan(status, createdAt, now) -> { kind, refreshInMs }
  queries.ts                  server-only: getDeckForView(id) (no idea column)
  actions.ts                  "use server": createDeck, retryDeck
  start-generation.ts         server-only: createAndStartDeck(idea) shared by both actions
```

This follows the existing split (`app/_components`, `src/ai`, `src/prisma`). `validation.ts` and
`polling.ts` stay free of `server-only`, so the client form can reuse the limits and Vitest can
import them.

_Alternative:_ import `MIN_IDEA_LENGTH` and `MAX_IDEA_LENGTH` from `src/ai/pitch-deck/`. Rejected
because those modules import `server-only` and cannot reach the client. The limits are therefore
written twice. If they ever drift apart, the service still re-validates, so the server stays safe.
The only cost is a confusing message.

### D2. Creating a deck: create the row, send the event, delete the row if the send fails

`createAndStartDeck(idea)`:

1. Insert `Deck { idea }`. Status defaults to `PENDING`.
2. `await inngest.send(deckGenerate.create({ deckId }))`.
3. If step 2 throws, delete the row, log the error on the server without the idea, and return a
   generic failure.
4. The action calls `redirect(\`/decks/${id}\`)`after the try/catch, because`redirect` works by
   throwing.

Delete over mark-`FAILED`: if the send actually reached Inngest but the call still threw (for
example, a timeout after acceptance), the run finds no deck and fails without retrying, so nothing
is spent. A deck marked `FAILED` would instead be generated in the background with nobody watching.

The event is sent from the Server Action, not from a route handler. A Server Action already has
the Origin check, needs no extra API surface, and gives `useActionState` errors for free.

### D3. Actions return a small, typed state; errors are never thrown to the client

```
type FormState = { status: "idle" } | { status: "error"; message: string; idea?: string }
```

`createDeck(prev, formData)` reads `formData.get("idea")`, runs `IdeaSchema.safeParse`, and returns
the first issue's message plus the submitted text, so the textarea keeps it (React 19 resets
uncontrolled forms after an action). `retryDeck(deckId, prev)` is bound with the deck id. The
bound argument comes from the client and can be forged, so the action re-validates it with
`DeckIdSchema`, loads the deck and continues only when `status === "FAILED"`. It then calls
`createAndStartDeck(deck.idea)`. The idea is read on the server and never sent to the browser.

### D4. Live status: `router.refresh()` from a tiny client poller

`DeckView` reads the deck with an uncached query (no `"use cache"`). It calls
`pollPlan(status, createdAt, Date.now())` after the query has resolved, so the time read happens
at request time. The result is one of:

- `done`: `COMPLETE` or `FAILED`. No poller is rendered.
- `poll`: `PENDING` or `GENERATING` and younger than 10 minutes. It renders
  `<DeckStatusPoller refreshInMs={3000} />`.
- `stale`: `PENDING` or `GENERATING` and 10 minutes or older. It renders the "taking longer than
  expected" notice with a "Check again" button that calls `router.refresh()` once.

The poller sets a single `setTimeout` and calls `router.refresh()`. The new server render returns
a fresh plan, so the loop continues or ends from the server's decision. The poller skips refreshes
while `document.visibilityState === "hidden"` and refreshes as soon as the tab is visible again.

_Alternatives:_ a JSON route handler polled with `fetch`, which needs a second read path, its own
validation and client rendering of slides. Or Inngest realtime or SSE, which may need a new
package and long-lived connections. `refresh()` reuses the page's own render and adds one database
read about every 3 seconds per open, in-progress page. Because staleness is based on `createdAt`,
it holds across reloads.

### D5. The view reads only what it shows

`getDeckForView(id)` selects `id, title, status, errorMessage, createdAt` and the slides
(`order, title, content, imagePrompt, imageUrl`) ordered by `order`. It never selects `idea`. This
enforces the "no raw idea" requirement in the query rather than in JSX. The page validates the id
with `DeckIdSchema` first and calls `notFound()` on a bad or unknown id. The `[id]` route has
static metadata (`title: "Pitch deck"`, `robots: { index: false, follow: false }`), so metadata
does not need a database read under `cacheComponents`.

### D6. Images: `next/image` with an allowlist, plus a guard before rendering

`next.config.ts` gains:

```
images: {
  remotePatterns: [
    { protocol: "https", hostname: "picsum.photos", pathname: "/seed/**" },
    { protocol: "https", hostname: "ik.imagekit.io" },
  ],
}
```

Optimised images are served from `/_next/image` on our own origin, so the CSP stays unchanged.
Picsum's redirect to `fastly.picsum.photos` is followed by the optimiser (default
`maximumRedirects: 3`). `next/image` throws during render for a host that is not allowed, so
`slide-card.tsx` first checks that `imageUrl` parses as an `https:` URL on one of those two hosts.
If it does not, the slide renders without an image and a warning is logged on the server. The
`alt` text is the slide's `imagePrompt`, which is a plain description of the scene. Images use
`width={1024} height={1024}` with responsive `sizes`, and only the first slide's image is
`priority`.

### D7. Abuse protection: Inngest flow control on `generate-deck`

Add `concurrency: { limit: 3 }` and `throttle: { limit: 30, period: "1h" }` to the function
options. Both are global (no `key`) because there is no trustworthy per-visitor identity.
Throttled runs are queued FIFO, not dropped. `rateLimit` is deliberately not used, because it
discards events and would leave decks `PENDING` for good. Inngest's concurrency counts executing
steps rather than whole runs, but this function's steps run back to back, so in practice it limits
concurrent decks. The numbers are starting values and live next to the existing `idempotency`
option.

_Alternatives:_ in-memory or IP-based limits in the Server Action. Rejected because they reset per
serverless instance, and `x-forwarded-for` can be forged unless a trusted proxy is configured.

### D8. UI composition

shadcn components: `button`, `textarea`, `field` (label, description and error wiring for
accessibility), `card`, `alert`, `skeleton`, `spinner`, `badge`. Add them with
`vp dlx shadcn@latest add ...`. Check that `package.json` is unchanged afterwards. If it changed,
stop and ask before going on.

- **Home:** a centred column (`max-w-2xl`) with a short headline and explanation, the textarea
  with a live character count (`n / 2000`) and a hint about the 20-character minimum, and a
  primary "Generate pitch deck" button that shows a spinner and is disabled while pending.
- **Deck page:** a status `badge`, plus an `aria-live="polite"` region for the status text.
  - Pending or generating: a skeleton of slide cards, and the text "Queued..." or "Writing your
    deck and creating slide images...".
  - Failed: a destructive `alert` with `errorMessage` rendered as text, a "Try again" button and a
    "Start over" link to `/`.
  - Stale: a neutral `alert` with "Check again".
  - Complete: the deck title as `h1`, then one card per slide (number, title, content, 1:1 image),
    stacked in one column on mobile and with the image beside the text from `md` up.

Colours come from the semantic tokens only. Use `cn` from `@/lib/utils` for conditional classes.

## Risks / Trade-offs

- **[Open generation endpoint]** Anyone can start decks and spend OpenAI credit. → Global throttle
  and concurrency (D7), the server-side 2,000-character limit, and the recommendation to set an
  OpenAI project spending limit. Per-visitor limits wait until there are accounts or a trusted
  edge.
- **[Share links are not authorization]** Anyone holding a link sees the deck. → The page shows
  generated content only (D5) and is `noindex`. Users should be told that links are shareable.
  Note: an evaluator rejection message can paraphrase the idea.
- **[Image optimiser as a proxy]** `ik.imagekit.io` with no `pathname` lets any ImageKit account's
  images through `/_next/image`. → Low impact for a demo. Tightening it to the account's
  `/<imagekit-id>/**` path needs a known endpoint, which is not configured today.
- **[Polling load]** About one database read every 3 seconds per open, in-progress page. → It stops
  at `COMPLETE`, `FAILED`, stale or a hidden tab. Acceptable at demo scale.
- **[Streaming `notFound()`]** Inside a Suspense boundary the response may already have started,
  so an unknown deck can return HTTP 200 with the not-found UI and a `noindex` tag. → Acceptable.
  The visible behaviour matches the spec.
- **[Duplicated limits]** 20 and 2,000 are defined in `src/decks/validation.ts` and again in
  `src/ai/pitch-deck/`. → A comment in both places names the other. The service re-validates.
- **[Local dev without Inngest]** Decks stay `PENDING` and become stale after 10 minutes. → The
  stale notice covers this, and the README/tasks note that the Inngest dev server is needed.

## Migration Plan

No data migration. Deploy as usual. Rollback is reverting the commit. Existing decks, if any,
render on the new page because the page only reads existing columns.
