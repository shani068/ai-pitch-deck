# Proposal

## Why

The app's core feature is turning a founder's business idea into a pitch deck, but nothing in the
codebase generates one yet: the `generate-deck` Inngest function is an empty stub and the pitch deck
schema is unused. `@openai/agents` is already installed, so the generation pipeline can be built now
on the SDK's agent, structured-output and guardrail primitives without adding dependencies.

## What Changes

- Add a generator agent (`pitchDeckAgent`) that turns a business idea into a structured pitch deck.
  It uses a configured OpenAI model, few-shot instructions and `PitchDeckSchema` as its structured
  output type.
- Add a separate evaluator agent that independently judges a generated deck's quality against the
  original idea. It never sees the generator's instructions or examples.
- Add an input guardrail that blocks business ideas shorter than 20 characters (after trimming)
  before the generator model runs.
- Add an output guardrail that reads the original idea from the run context, sends it with the
  generated deck to the evaluator, and blocks decks the evaluator does not approve.
- Add a generation service, `generatePitchDeck(idea)`. It validates the idea (at most 2,000
  characters), runs the generator, re-validates the final output with `PitchDeckSchema`, and turns
  guardrail and SDK errors into a typed error with safe messages.
- Move `src/schema/pitch-deck.ts` into the new `src/ai/pitch-deck/` folder, so all pitch deck
  generation code sits in one flat folder. Nothing imports the old path yet.

## Capabilities

### New Capabilities

- `pitch-deck-generation`: How a business idea becomes a validated, quality-checked pitch deck. It
  covers input acceptance rules, the deck's structure, independent quality evaluation, and the
  errors callers receive when generation is rejected or fails.

### Modified Capabilities

None. Generation does not touch the database or the UI design system.

## Impact

- **New code:** `src/ai/pitch-deck/` with `schema.ts`, `pitch-deck-agent.ts`, `evaluator-agent.ts`,
  `guardrails.ts` and `service.ts`.
- **Moved code:** `src/schema/pitch-deck.ts` becomes `src/ai/pitch-deck/schema.ts`, and the empty
  `src/schema/` folder is removed.
- **Dependencies:** none added. Uses the already-installed `@openai/agents`, `zod` (v4) and
  `server-only`.
- **Environment:** the SDK reads `OPENAI_API_KEY`, which is already listed in `.env`. No new
  variables.
- **Cost and latency:** each generation makes two model calls (generator, then evaluator), and the
  few-shot examples are sent with every generator call.
- **Out of scope:** wiring the service into `inngest/functions/generate-deck.ts`, saving decks to
  the database, image generation and UI.
