# Design

## Context

See proposal.md for motivation and the three delta specs for required behaviour. Current state that
shapes the approach:

- `lib/openai.ts` holds a lazy `getOpenAIClient()` plus `IMAGE_MODEL = "gpt-image-1-mini"` and
  `IMAGE_SIZE = "1024x1024"`. `lib/imageKit.ts` holds a lazy `getImageKit()` and imports `toFile`
  without using it. Neither file exports anything, and neither imports `server-only`.
- `generatePitchDeck(idea)` throws only `PitchDeckGenerationError`, whose `message` is user-safe
  and whose `cause` holds the SDK or provider error. Both fail-closed paths in
  `deckQualityOutputGuardrail` set `outputInfo.score` to `null`. A real evaluator verdict always has
  an integer score from 1 to 10.
- `inngest/client.ts` defines the typed event `deckGenerate` (`deck/generate`, `{ deckId: z.cuid2() }`).
  The function stub triggers on the plain string instead. `inngest@4.26.2` provides
  `NonRetriableError`, `idempotency`, `retries` (default 3, applied per step) and `onFailure`.
  `onFailure` receives the original event at `event.data.event` and the final error, which has been
  serialized and deserialized.
- Prisma 8 (`@prisma/orm-postgres`): models live under `db.orm.public`. Writes need a filter
  (`.where(...).update(...)`, `.where(...).deleteAll()`), bulk insert is `createAll` (returns rows)
  or `createAndCount` (returns a count), and `db.transaction(async (tx) => ...)` commits when the
  callback returns and rolls back when it throws. `Slide` has no unique key on `(deckId, order)`.
- `server-only` throws outside Next.js's server environment. The Inngest handler runs inside Next.js
  (`app/api/inngest/route.ts`), so server-only modules work there.
- The repo has no automated tests.

## Goals / Non-Goals

**Goals:**

- Three responsibilities in separate places: provider calls in `lib/`, image mode and fallback in
  one slide image module, orchestration in the Inngest function.
- Every external call is behind a step, so a retry repeats only the step that failed.
- No schema migration and no new dependency.

**Non-Goals:**

- Retrying a deck that failed within the 24-hour idempotency window. That needs a different event
  key or a dedicated "regenerate" path, and no UI exists yet to trigger it.
- Falling back to a placeholder when a single image is rejected by moderation. A moderation-blocked
  prompt fails like any other image error.
- Deleting ImageKit files when a deck is deleted.

## Decisions

### Module layout

```
lib/openai.ts                       + generateImage(prompt): Promise<Buffer>
lib/imageKit.ts                     + uploadImage(buffer, fileName): Promise<string>
src/ai/pitch-deck/slide-image.ts    placeholderImagesEnabled(), placeholderImageUrl(deckId, order),
                                    generateSlideImage({ deckId, order, imagePrompt })
src/ai/pitch-deck/service.ts        + "EVALUATION_FAILED" code
inngest/functions/generate-deck.ts  orchestration only
```

Imports run one way: `inngest/functions` -> `src/ai/pitch-deck` -> `lib`.

- **The provider functions go next to their clients.** `generateImage` calls
  `getOpenAIClient().images.generate({ model: IMAGE_MODEL, prompt, size: IMAGE_SIZE, n: 1 })`, reads
  `data[0].b64_json` (gpt-image models always return base64) and returns
  `Buffer.from(b64, "base64")`. It throws if no image data comes back. `uploadImage` calls
  `getImageKit().files.upload({ file: await toFile(buffer, fileName), fileName, folder,
  useUniqueFileName: false, overwriteFile: true })` and returns the response `url`, throwing if it is
  missing. Both files gain `import "server-only"`. No client or constant is duplicated.
- **The slide image module owns the mode decision.** It is the only place that knows about Picsum or
  the flag, so neither the provider files nor the workflow need to change when the mode changes.
- **Alternative considered:** a strategy interface with two implementations. Two branches of an
  `if` do not need an interface.

### Image mode flag

`USE_PLACEHOLDER_IMAGES` is parsed with Zod v4
`z.stringbool({ truthy: ["true"], falsy: ["false"] })`, made optional and defaulting to `true`
(see the slide-image-generation spec). The parse error names the variable and the accepted values,
and never echoes the value.

- **It is read when an image is requested, not when the module loads.** An invalid value throws
  inside the image step and fails that run. At module load it would throw while
  `/api/inngest` imports the function, which would take every Inngest function offline.
- **Alternative considered:** a code constant. Changing it needs an edit and a deploy, and it is easy
  to commit in the wrong state.

### Deterministic image names and placeholders

- ImageKit: folder `/decks/{deckId}`, file name `slide-{order}.png`, with `useUniqueFileName: false`
  and `overwriteFile: true`. A retried upload replaces the file instead of leaving an orphan.
- Picsum: `https://picsum.photos/seed/{encodeURIComponent(`${deckId}-${order}`)}/1024/1024`. Seeded
  URLs return the same image every time. The 1024x1024 size matches `IMAGE_SIZE`, so both modes have
  the same aspect ratio.

### Workflow steps

```
deck/generate (triggers: [deckGenerate], idempotency: "event.data.deckId")
  parse deckId with the event's Zod schema       invalid -> NonRetriableError
  step "load-deck"          Deck by id -> { id, idea, status }
                            missing -> NonRetriableError; COMPLETE -> return early
  step "mark-generating"    status GENERATING, errorMessage null
  step "generate-content"   generatePitchDeck(idea) -> PitchDeck (memoized JSON)
  for each slide, in order:
    step "generate-slide-image-{order}"  generateSlideImage(...) -> url
  step "save-deck"          db.transaction:
                              Slide.where({ deckId }).deleteAll()
                              Slide.createAndCount(rows with order 0..n-1)
                              Deck.where({ id }).update({ title, status: COMPLETE, errorMessage: null })
onFailure
  step "mark-failed"        Deck.where({ id }).update({ status: FAILED, errorMessage })
```

- **Generating and uploading an image happen in one step.** Step output is serialized to JSON and
  size-limited, so a Buffer cannot be returned from one step and passed to the next. The step
  returns only the URL.
- **Content generation is its own step.** Its memoized output stops a later retry from paying for
  two more model calls and getting a different deck than the images were made for.
- **Image steps run one after another.** This is simpler and stays under the image model's rate
  limits. Each step is a separate request to the handler, so total duration does not hit a single
  request's timeout. Parallel steps with `Promise.all` would be faster but bunch up rate-limit
  errors.
- **Saving is one transaction that deletes and re-inserts.** Without a unique key on
  `(deckId, order)` an upsert would need a migration. Delete-then-insert inside `db.transaction`
  gives the same outcome, and committing title, slides and `COMPLETE` together means readers never
  see a half-saved deck. `createAndCount` is used because the inserted rows are not needed.
- **A deck that is already `COMPLETE` ends the run early.** This covers events replayed after the
  idempotency window. A `GENERATING` or `FAILED` deck is generated again.
- **Idempotency is on the function.** `idempotency: "event.data.deckId"` skips duplicate events for
  the same deck for 24 hours. The early return covers the rest.

### Retries, rejections and failure status

| Failure                                                    | Thrown from the step               | Inngest behaviour |
| ---------------------------------------------------------- | ---------------------------------- | ----------------- |
| `INPUT_REJECTED`, `QUALITY_REJECTED`                       | `NonRetriableError(error.message)` | fails at once     |
| `EVALUATION_FAILED`, `INVALID_OUTPUT`, `GENERATION_FAILED` | `Error(error.message)`             | retried           |
| deck missing, malformed deck id                            | `NonRetriableError(safe message)`  | fails at once     |
| image, ImageKit, database, invalid flag                    | the original error                 | retried           |

- **The service tells the evaluator outcomes apart.** `DeckQualityInfoSchema` is extended with
  `score: z.number().int().nullable()`. When the output tripwire fires and `score` is `null`, or the
  info cannot be parsed, the error is `EVALUATION_FAILED` with a generic retry message. Otherwise it
  is `QUALITY_REJECTED`, as now. `guardrails.ts` does not change: its fail-closed paths already mark
  themselves with `score: null`.
- **Errors leaving a step carry no `cause`.** Inngest serializes thrown errors, including `cause`,
  and stores them in its run history. The `cause` of a `PitchDeckGenerationError` can contain the
  idea, the generated deck or provider error text. The workflow logs the cause on the server with
  `console.error` and throws a new error with only the safe message.
- **`FAILED` is written only in `onFailure`.** A `catch` in the handler would mark the deck `FAILED`
  on the first attempt even when a retry is pending. `onFailure` runs once, after the run fails for
  good.
- **The safe message is chosen by error name.** The error `onFailure` receives has been through
  serialization, so `instanceof` does not work. If `error.name === "NonRetriableError"`, its message
  is one this workflow wrote from a safe source and is saved. Anything else gets the generic
  `"The pitch deck could not be generated. Please try again later."`. `onFailure` re-parses the deck
  id from `event.data.event.data` and does nothing if it is invalid. An update that matches no deck
  is a no-op.
- **Alternative considered:** writing `FAILED` just before throwing `NonRetriableError`. That avoids
  relying on error names after deserialization, but splits failure handling across two places.

## Risks / Trade-offs

- [The deserialized error might not keep `name === "NonRetriableError"`] -> Verify with the Inngest
  dev server during the rejection test. If the name is lost, every failure gets the generic message,
  which is safe but less helpful. In that case, switch to the "write before throwing" alternative
  for rejections.
- [Retries multiply provider calls: the OpenAI SDK retries 2 times by default, inside each of
  Inngest's 4 attempts per step] -> Accepted for now. Each step stays small, and content generation
  is memoized once it succeeds.
- [`EVALUATION_FAILED` is now retriable, so a persistently failing evaluator costs a generator call
  plus an evaluator call per attempt] -> Bounded by the per-step retry limit, then marked `FAILED`.
- [Overwriting an ImageKit file can leave its CDN cache serving the earlier upload] -> Overwrites
  only happen when a step is retried within the run, and both uploads were made from the same prompt.
  Acceptable.
- [A moderation-blocked image prompt is retried pointlessly, then fails the deck] -> Accepted, see
  Non-Goals. A later change can map the provider's moderation error to `NonRetriableError` or a
  placeholder.
- [Content generation can take longer than a hosting platform's default function timeout] -> Each
  step is its own request, but the `generate-content` request itself makes two model calls. If the
  deploy target has a short default, raise the route's `maxDuration` when deploying.
- [Image URLs will not display yet: the CSP `img-src` allows only `'self' blob: data:`] -> Out of
  scope. The viewer change must allow the ImageKit endpoint, `picsum.photos` and
  `fastly.picsum.photos`.

## Migration Plan

- No database migration. The contract is unchanged.
- Add `USE_PLACEHOLDER_IMAGES`, `OPENAI_API_KEY` and `IMAGEKIT_PRIVATE_KEY` to `.env.example`. In
  production, set `USE_PLACEHOLDER_IMAGES=false` explicitly.
- Rollback: revert the change. The function goes back to an empty stub, and decks left in
  `GENERATING` can be reset by hand.
