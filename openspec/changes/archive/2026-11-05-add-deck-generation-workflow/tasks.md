# Tasks

## 1. Provider functions

- [x] 1.1 In `lib/openai.ts`, add `import "server-only"` and export
      `generateImage(prompt: string): Promise<Buffer>`. - Call `getOpenAIClient().images.generate` with the existing `IMAGE_MODEL` and `IMAGE_SIZE`
      and `n: 1`. - Return `Buffer.from(data[0].b64_json, "base64")`, and throw a plain error with a fixed
      message when no image data comes back. - Do not add another client or constant. - Verify with `vp check`.
- [x] 1.2 In `lib/imageKit.ts`, add `import "server-only"` and export
      `uploadImage(buffer: Buffer, options: { fileName: string; folder: string }): Promise<string>`. - Use the existing `getImageKit()` and `toFile`, with `useUniqueFileName: false` and
      `overwriteFile: true`. - Return the response `url`, and throw a fixed-message error when it is missing. - Verify with `vp check`. The `toFile` import is now used, so no lint warning remains.

## 2. Slide image module

- [x] 2.1 Create `src/ai/pitch-deck/slide-image.ts` with `import "server-only"`. - Add `placeholderImagesEnabled()`, which parses `process.env.USE_PLACEHOLDER_IMAGES` on each call
      with `z.stringbool({ truthy: ["true"], falsy: ["false"] })`, optional and defaulting to
      `true`. - On a parse failure, throw an error that names the variable and `"true"`/`"false"`, without
      echoing the value. - Verify with `vp check`.
- [x] 2.2 Add `placeholderImageUrl(deckId: string, order: number): string`, returning
      `https://picsum.photos/seed/{encodeURIComponent(`${deckId}-${order}`)}/1024/1024`. - Verify with `vp check`, and by opening two generated URLs (same input twice, then a
      different `order`) in a browser: the same input gives the same image, a different order gives
      a different image.
- [x] 2.3 Add `generateSlideImage({ deckId, order, imagePrompt }): Promise<string>`. - In placeholder mode it returns `placeholderImageUrl(deckId, order)` and calls nothing else. - Otherwise it returns `uploadImage(await generateImage(imagePrompt), { folder:
      `/decks/${deckId}`, fileName: `slide-${order}.png` })`. - Verify with `vp check`, and by confirming that `slide-image.ts` is the only file that refers
      to Picsum or `USE_PLACEHOLDER_IMAGES` (search the repo).
- [x] 2.4 Add `USE_PLACEHOLDER_IMAGES`, `OPENAI_API_KEY` and `IMAGEKIT_PRIVATE_KEY` to
      `.env.example`, with placeholder values and one comment each. The comments say the mode
      defaults to `true` when unset, and that both keys are needed only when it is `false`. Verify by
      reading the file: no real secrets appear.

## 3. Evaluator failure code

- [x] 3.1 In `src/ai/pitch-deck/service.ts`, add `"EVALUATION_FAILED"` to `PitchDeckErrorCode`,
      with a fixed message such as "The pitch deck could not be reviewed right now. Please try
      again." - Extend `DeckQualityInfoSchema` with `score: z.number().int().nullable()`. - For an `OutputGuardrailTripwireTriggered`, return `EVALUATION_FAILED` when `outputInfo`
      fails to parse or `score` is `null`, and `QUALITY_REJECTED` (unchanged) otherwise. - Leave `guardrails.ts` unchanged. - Verify with `vp check`, and by reading `guardrails.ts`: both `failClosed` paths set
      `score: null`, and a real verdict always has a number.

## 4. Inngest workflow

- [x] 4.1 Rewrite `inngest/functions/generate-deck.ts` to use `triggers: [deckGenerate]` and
      `idempotency: "event.data.deckId"`. - Re-parse `event.data` with the event's Zod schema, and throw `NonRetriableError` with a
      fixed message when it is invalid. - Verify with `vp check`: `event.data.deckId` is typed as `string` without casts.
- [x] 4.2 Add step `load-deck`, reading `id`, `idea` and `status` from `db.orm.public.Deck` by id. - Throw `NonRetriableError("The deck could not be found.")` when there is no row. - Return early, before any other step, when the status is `COMPLETE`. - Add step `mark-generating`, which sets `status: "GENERATING"` and `errorMessage: null` with
      `.where({ id }).update(...)`. - Verify with `vp check`.
- [x] 4.3 Add step `generate-content`, which calls `generatePitchDeck(deck.idea)`. - Catch `PitchDeckGenerationError` and log its `cause` on the server with `console.error`. - Throw `NonRetriableError(error.message)` for `INPUT_REJECTED` and `QUALITY_REJECTED`, and
      `new Error(error.message)` for the other codes. Neither carries a `cause`. - Verify with `vp check`.
- [x] 4.4 Loop over the generated slides in order with one step per slide,
      `generate-slide-image-{order}`, each calling `generateSlideImage` and returning only the URL.
      Verify with `vp check`. The step output type is `string`, and no Buffer crosses a step
      boundary.
- [x] 4.5 Add step `save-deck`, which runs one `db.transaction` that: - deletes the deck's slides with `tx.orm.public.Slide.where({ deckId }).deleteAll()`; - inserts every slide with `createAndCount`, with `order` 0..n-1 and its title, content,
      image prompt and image URL; - updates the deck with title, `status: "COMPLETE"` and `errorMessage: null`. - Verify with `vp check`.
- [x] 4.6 Add an `onFailure` handler. - Re-parse the deck id from `event.data.event.data`, and return when it is invalid. - In step `mark-failed`, set `status: "FAILED"` and `errorMessage`: the error's message when
      `error.name === "NonRetriableError"`, otherwise the fixed generic message. - Verify with `vp check`, and by reading the handler: no other path writes `FAILED`.
- [x] 4.7 Run `vp check` and `vp run build`, and confirm that both pass and that the build output
      lists `/api/inngest`.

## 5. End-to-end verification with the Inngest dev server

For each scenario, run `vp run dev` and the Inngest dev server, create a `PENDING` deck row (for
example with the Neon SQL editor), send `deck/generate` with its id from the dev server UI, and
check the run timeline and the deck and slide rows. Fault injections are temporary local edits.
Revert each one and confirm `git diff` is clean of them before moving on.

- [x] 5.1 Success, placeholder mode (`USE_PLACEHOLDER_IMAGES` unset). The deck ends `COMPLETE` with
      a title and 5–8 slides at orders 0..n-1, each with a `picsum.photos` URL. No OpenAI image or
      ImageKit call appears in the run.
- [x] 5.2 Success, OpenAI mode (`USE_PLACEHOLDER_IMAGES=false`). Each slide URL is an ImageKit URL
      under `/decks/{deckId}/slide-{order}.png`, and the ImageKit media library holds exactly one
      file per slide.
- [x] 5.3 Guardrail rejection: a deck whose idea is shorter than 20 characters. The run fails
      after one attempt with no retries. The deck is `FAILED`, `errorMessage` is the minimum-length
      message, and there are no slides. This also confirms the `NonRetriableError` name survives
      into `onFailure`. If it does not, stop and apply the design's fallback before continuing.
- [x] 5.4 Evaluator temporary failure: temporarily make the evaluator call throw. `generate-content`
      is retried, the deck stays `GENERATING` between attempts, and after the last attempt it is
      `FAILED` with the generic message. Revert the injection.
- [x] 5.5 Image failure: temporarily make `generateSlideImage` throw once for order 2. The step for
      order 2 is retried and the run then completes. `generate-content` and the image steps for
      orders 0 and 1 ran once, and the deck has no duplicate slides. Revert the injection.
- [x] 5.6 Retried save: temporarily throw at the end of the `save-deck` transaction callback on the
      first attempt only. The transaction rolls back, the retry succeeds, and the deck has exactly
      one slide per position. Revert the injection.
- [x] 5.7 Duplicate events: send `deck/generate` twice for the same new deck. Only one run starts.
      Then replay the completed run from the dev server: it returns early and the slides are
      unchanged.
- [x] 5.8 Invalid flag: set `USE_PLACEHOLDER_IMAGES=yes`. The image step fails with the message
      naming the variable, the deck ends `FAILED` with the generic message, and no OpenAI or ImageKit
      call is made. Restore the variable.

## Workflow follow-up

- Archive the change with `/opsx:archive` after verification, so the three delta specs merge into
  `openspec/specs/`.
- Follow-up change: allow the ImageKit endpoint and Picsum hosts in the CSP `img-src` when the deck
  viewer is built.
