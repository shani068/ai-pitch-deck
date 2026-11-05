# Proposal

## Why

`generatePitchDeck()` produces a validated, quality-checked deck, but nothing runs it, saves the
result or creates slide images. The `generate-deck` Inngest function is an empty stub, and
`lib/openai.ts` and `lib/imageKit.ts` configure clients that nothing uses. Generation takes minutes
and depends on several external calls, so it has to run as a retryable background job rather than
in a request.

## What Changes

- Add slide image generation. By default each slide's image prompt is sent to OpenAI's image model,
  the returned image is uploaded to ImageKit under a deterministic file name (overwriting), and the
  ImageKit URL is returned.
- Add a placeholder image mode that returns deterministic Picsum URLs and calls neither OpenAI nor
  ImageKit. A Zod-validated environment variable, `USE_PLACEHOLDER_IMAGES`, selects the mode; when
  it is unset, placeholder mode is used.
- Implement the `generate-deck` Inngest function, triggered by the typed `deckGenerate` event.
  It loads the deck, marks it `GENERATING`, generates the deck content, generates one image per
  slide, then saves the title and all slides and marks the deck `COMPLETE` in one transaction.
  Each external operation is its own retryable step, and saving replaces existing slides so a
  retry never duplicates them.
- Mark the deck `FAILED` with a user-safe message only after Inngest has exhausted retries, using
  the function's `onFailure` handler. Guardrail rejections are non-retriable.
- Add function-level idempotency keyed on the deck id, so a duplicate `deck/generate` event within
  Inngest's 24-hour idempotency window does not start a second run.
- Distinguish a genuine evaluator rejection from a temporary evaluator failure. The deck is still
  blocked in both cases (fail closed), but a temporary failure now raises a new, retriable
  evaluation-failed error instead of a quality-rejected error.
- Export one function each from `lib/openai.ts` (generate an image as a Buffer) and
  `lib/imageKit.ts` (upload a Buffer, return its URL), reusing their existing clients and settings,
  and mark both modules `server-only`.

## Capabilities

### New Capabilities

- `slide-image-generation`: How a slide's image prompt becomes a stored image URL: generated and
  hosted images, the placeholder mode, how the mode is configured, and what happens on retries.
- `deck-generation-workflow`: How a requested deck is generated in the background and saved: deck
  status transitions, saving the title and slides, retries, idempotency and the failure message
  stored on the deck.

### Modified Capabilities

- `pitch-deck-generation`: "Evaluation fails closed" changes so that an evaluator that cannot
  complete produces a distinct evaluation-failed error instead of a quality-rejected error, and
  "Failures produce typed, safe errors" grows from four error codes to five.

## Impact

- **Changed code:** `lib/openai.ts`, `lib/imageKit.ts`, `inngest/functions/generate-deck.ts`,
  `src/ai/pitch-deck/service.ts`, and possibly `src/ai/pitch-deck/guardrails.ts` (to tell the two
  evaluator outcomes apart).
- **New code:** one slide image module that holds the mode flag, the placeholder URL builder and the
  mode switch.
- **Database:** no contract or migration change. Uses the existing `Deck` and `Slide` models with
  Prisma 8 APIs (`db.transaction`, `where(...).deleteAll()`, `createAll`/`createAndCount`,
  `where(...).update()`).
- **Dependencies:** none added. Uses the installed `openai`, `@imagekit/nodejs`, `inngest`,
  `@prisma/orm-postgres`, `zod` and `server-only`.
- **Environment:** new optional `USE_PLACEHOLDER_IMAGES`; `OPENAI_API_KEY` and
  `IMAGEKIT_PRIVATE_KEY` are required only in OpenAI mode. `.env.example` documents all three.
- **Cost:** OpenAI mode makes one image call per slide (5–8 per deck) on top of the two text model
  calls. Retries can repeat image calls for slides whose step did not complete.
- **Out of scope:** creating decks and sending `deck/generate` (no caller exists yet), the deck
  viewer UI, and the CSP `img-src` change that the viewer will need to show ImageKit and Picsum
  images.
