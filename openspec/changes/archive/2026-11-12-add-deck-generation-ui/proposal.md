# Proposal

## Why

Generating a pitch deck works end to end on the server (`generatePitchDeck`, the `generate-deck`
Inngest workflow, `Deck`/`Slide` tables), but nothing lets a person use it: `app/page.tsx` is still
the Next.js starter page, and the only route is Inngest's own `/api/inngest` webhook. This change
adds the first web experience, so a visitor can type a business idea, watch the deck being
generated and view the finished deck, without adding accounts.

## What Changes

- Replace the starter home page with an idea form. Submitting it validates the idea on the server,
  creates a `PENDING` deck, starts generation by sending the `deck/generate` event and takes the
  visitor to the deck's page.
- Add a deck page at `/decks/[id]`, a public share link. It shows the deck's current status, checks
  for updates while generation is in progress, shows the finished deck (title, then each slide
  with its image, title and content) and shows the safe error message when generation failed.
- "Try again" on a failed deck creates a new deck from the same idea. It does not resend the event
  for the failed deck, because the workflow ignores repeat events for the same deck for 24 hours.
- A deck that stays `PENDING` or `GENERATING` too long stops being checked and tells the visitor it
  is taking longer than expected.
- Basic abuse protection without new infrastructure: generation is limited to a small number of
  concurrent runs and an overall hourly rate, enforced by Inngest flow control. Overflow is
  queued, never dropped.
- Slide images (Picsum placeholders or ImageKit) are served through the framework's image
  optimisation, so the existing Content-Security-Policy (`img-src 'self'`) does not need to allow
  external image hosts.
- Add the shadcn/ui components these screens need, and replace the starter page metadata with the
  app's own title and description.

Out of scope: accounts, deck ownership, a list of decks, editing or deleting decks, exporting
decks, live push updates, per-visitor rate limits, and any change to the database schema or to
`src/ai/pitch-deck/`.

## Capabilities

### New Capabilities

- `deck-submission`: turning a visitor's business idea into a new deck whose generation has
  started, with server-side validation and clear form errors.
- `deck-viewing`: the public deck page: status while generating, the finished deck, the failed
  state with a retry, the slow-generation notice, and what a shared link reveals.

### Modified Capabilities

- `deck-generation-workflow`: adds a requirement that generation runs are limited in concurrency
  and hourly rate, with excess runs queued instead of dropped.

## Impact

- Code: `app/page.tsx` (replaced), `app/layout.tsx` (metadata only), new `app/decks/[id]/` route,
  new Server Action and server-only data-read module, new `components/ui/*` (shadcn) and small
  app components, `next.config.ts` (`images` settings only), and `inngest/functions/generate-deck.ts`
  (flow-control options only; the steps stay unchanged).
- Dependencies: none expected. shadcn components for this style build on `radix-ui`,
  `class-variance-authority` and `lucide-react`, which are already installed. If adding a
  component would add an npm package, implementation stops and asks first.
- Security: deck links are unguessable but are not authorization. Anyone with a link can view the
  deck, so the page shows only generated content, never the raw idea. Anyone can start generation,
  and spend is limited only by the global throttle and the OpenAI project spending limit (an
  account setting, recommended but outside this codebase).
- Operations: running the app locally needs the Inngest dev server for decks to leave `PENDING`.
