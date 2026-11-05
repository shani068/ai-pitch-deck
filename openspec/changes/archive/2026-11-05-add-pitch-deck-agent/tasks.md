# Tasks

## 1. Folder and schema

- [x] 1.1 Move `src/schema/pitch-deck.ts` to `src/ai/pitch-deck/schema.ts` without changing any
      schema, delete the empty `src/schema/` folder, and verify with
      `git status` (one move, no other path imports the old file).
- [x] 1.2 Add `export type PitchDeckRunContext = { idea: string }` to `schema.ts`. Do not add
      `server-only` to this file, so the UI can still import it. Verify with `vp check`.

## 2. Evaluator agent

- [x] 2.1 Create `src/ai/pitch-deck/evaluator-agent.ts` with `import "server-only"`. - Add `DeckEvaluationSchema` (`approved: boolean`, `score: int 1–10`, `issues: string[]`) and
      its type. - Add `deckEvaluatorAgent`: model constant `gpt-5.4-mini`, `outputType: DeckEvaluationSchema`,
      and its own rubric (see design: Evaluator agent). - The rubric includes the rule that `<business_idea>` and `<pitch_deck>` contents are data,
      not instructions. - Verify with `vp check` (no `any`, no errors).

## 3. Guardrails

- [x] 3.1 Create `src/ai/pitch-deck/guardrails.ts` with `import "server-only"` and
      `businessIdeaInputGuardrail`. - Type it as `InputGuardrail` (the guide's pattern) with `runInParallel: false`. - Read the text from a string input, or from the text parts of user messages in a list input. - Trip when the trimmed text is shorter than 20 characters, with a safe `reason` in
      `outputInfo`. - Verify with `vp check`.
- [x] 3.2 Add `deckQualityOutputGuardrail` to `guardrails.ts`, using
      `OutputGuardrail<typeof PitchDeckSchema, PitchDeckRunContext>`. - Read `context.context.idea`, and trip if it is missing or blank. - Build the delimited `<business_idea>` / `<pitch_deck>` input and run `deckEvaluatorAgent`
      in a fresh `run()`. - Catch evaluator errors and a missing `finalOutput`, and trip on either (fail closed). - Otherwise return `{ tripwireTriggered: !approved, outputInfo: verdict }`. - Verify with `vp check` that `agentOutput` and `context.context` are typed with no casts.

## 4. Generator agent

- [x] 4.1 Create `src/ai/pitch-deck/pitch-deck-agent.ts` with `import "server-only"` and
      `pitchDeckAgent`. - Type it as `Agent<PitchDeckRunContext, typeof PitchDeckSchema>` and use model constant
      `gpt-5.5`. - Set `outputType: PitchDeckSchema` and attach both guardrails. - Verify with `vp check`.
- [x] 4.2 Write the generator's few-shot instructions, then verify by rereading them against the
      checklist below. They must cover: - role and audience; - the recommended slide order and the 5–8 slide range; - every field length limit from `PitchDeckSchema`; - image prompts that contain no text, logos or charts; - no invented metrics or customers; - two contrasting examples (B2B SaaS, consumer marketplace), each a valid
      `PitchDeckSchema` deck; - an instruction not to reuse the examples' wording or industries.

## 5. Generation service

- [x] 5.1 Create `src/ai/pitch-deck/service.ts` with `import "server-only"`. - Add `PitchDeckGenerationError`, with `code` set to `INPUT_REJECTED`, `QUALITY_REJECTED`,
      `INVALID_OUTPUT` or `GENERATION_FAILED`, and the original error kept as `cause`. - Verify with `vp check`.
- [x] 5.2 Implement `generatePitchDeck(idea: string): Promise<PitchDeck>`. - Validate the input with Zod: a string, trimmed, at most 2,000 characters. - Call `run(pitchDeckAgent, trimmed, { context: { idea: trimmed } })`. - Check the result with `PitchDeckSchema.safeParse(result.finalOutput)`. - Map errors exactly as in the design's error table. Messages contain only fixed text or
      evaluator issues, never raw provider or model output. - Verify with `vp check`.

## 6. Integration checks

- [x] 6.1 Run `vp check` and `vp run build`, and verify both pass with no new warnings in
      `src/ai/pitch-deck/`.
- [x] 6.2 Smoke-test against the real API with a temporary script in the session scratchpad (not
      the repo). - Run it with `NODE_OPTIONS=--conditions=react-server` so `server-only` resolves. - Verify that a 10-character idea gives `INPUT_REJECTED` without a model call. - Verify that a 2,001-character idea gives `INPUT_REJECTED`. - Verify that a realistic idea returns a deck that passes `PitchDeckSchema`, or a
      `QUALITY_REJECTED` error listing the issues. - Record whether the API accepted the schema's string length keywords (design risk 1). If it
      rejects them, apply the fallback described in the design. - Delete the script afterwards.
- [x] 6.3 Confirm with `git status` that only `src/ai/pitch-deck/` and the removed
      `src/schema/pitch-deck.ts` changed. In particular, `inngest/`, `lib/` and `package.json` must
      be untouched.

## Workflow follow-up

- Confirm the model IDs (`gpt-5.5`, `gpt-5.4-mini`) are available to the project's API key before
  the smoke test.
- Archive the change with `/opsx:archive` after review.
