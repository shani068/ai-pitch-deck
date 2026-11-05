import "server-only";

import {
  InputGuardrailTripwireTriggered,
  ModelBehaviorError,
  OutputGuardrailTripwireTriggered,
  run,
} from "@openai/agents";
import { z } from "zod";

import { pitchDeckAgent } from "./pitch-deck-agent";
import { PitchDeckSchema, type PitchDeck } from "./schema";

export const MAX_IDEA_LENGTH = 2000;

export type PitchDeckErrorCode =
  | "INPUT_REJECTED"
  | "QUALITY_REJECTED"
  | "EVALUATION_FAILED"
  | "INVALID_OUTPUT"
  | "GENERATION_FAILED";

/**
 * The only error `generatePitchDeck` throws. `message` is safe to show to users; the
 * underlying SDK or provider error, if any, is kept on `cause` for server-side logging.
 */
export class PitchDeckGenerationError extends Error {
  readonly code: PitchDeckErrorCode;

  constructor(code: PitchDeckErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PitchDeckGenerationError";
    this.code = code;
  }
}

const MESSAGES = {
  inputRejected: "Please describe your business idea in more detail.",
  qualityRejected: "The generated pitch deck did not pass the quality review. Please try again.",
  evaluationFailed: "The pitch deck could not be reviewed right now. Please try again.",
  invalidOutput: "The generated pitch deck was incomplete or malformed. Please try again.",
  generationFailed: "The pitch deck could not be generated right now. Please try again later.",
} as const;

const IdeaInputSchema = z
  .string({ error: "Please describe your business idea as text." })
  .trim()
  .max(MAX_IDEA_LENGTH, {
    error: `Please keep your business idea under ${MAX_IDEA_LENGTH.toLocaleString("en-US")} characters.`,
  });

// Guardrail `outputInfo` is typed `any` by the SDK, so it is validated before use.
const IdeaLengthInfoSchema = z.object({ reason: z.string() });
// `score` is null only on the guardrail's fail-closed paths, where no verdict was reached.
const DeckQualityInfoSchema = z.object({
  score: z.number().int().nullable(),
  issues: z.array(z.string()),
});

function toGenerationError(error: unknown): PitchDeckGenerationError {
  if (error instanceof InputGuardrailTripwireTriggered) {
    const info = IdeaLengthInfoSchema.safeParse(error.result.output.outputInfo);
    const message = info.success ? info.data.reason : MESSAGES.inputRejected;
    return new PitchDeckGenerationError("INPUT_REJECTED", message, { cause: error });
  }

  if (error instanceof OutputGuardrailTripwireTriggered) {
    const info = DeckQualityInfoSchema.safeParse(error.result.output.outputInfo);
    // No verdict (evaluator failed, or its info is unreadable): blocked, but worth retrying.
    if (!info.success || info.data.score === null) {
      return new PitchDeckGenerationError("EVALUATION_FAILED", MESSAGES.evaluationFailed, {
        cause: error,
      });
    }

    const { issues } = info.data;
    const message =
      issues.length > 0
        ? `The generated pitch deck did not pass the quality review: ${issues.join(" ")}`
        : MESSAGES.qualityRejected;
    return new PitchDeckGenerationError("QUALITY_REJECTED", message, { cause: error });
  }

  if (error instanceof ModelBehaviorError) {
    return new PitchDeckGenerationError("INVALID_OUTPUT", MESSAGES.invalidOutput, { cause: error });
  }

  return new PitchDeckGenerationError("GENERATION_FAILED", MESSAGES.generationFailed, {
    cause: error,
  });
}

/**
 * Turns a business idea into a pitch deck that has passed the input guardrail, the
 * structured-output schema and the independent quality evaluation.
 *
 * @throws {PitchDeckGenerationError} for every failure, with a code callers can branch on.
 */
export async function generatePitchDeck(idea: string): Promise<PitchDeck> {
  const input = IdeaInputSchema.safeParse(idea);
  if (!input.success) {
    const message = input.error.issues[0]?.message ?? MESSAGES.inputRejected;
    throw new PitchDeckGenerationError("INPUT_REJECTED", message, { cause: input.error });
  }
  const trimmedIdea = input.data;

  let finalOutput: unknown;
  try {
    // The idea is passed twice: as the agent's input, and as run context for the output
    // guardrail, which forwards it to the evaluator agent.
    const result = await run(pitchDeckAgent, trimmedIdea, { context: { idea: trimmedIdea } });
    finalOutput = result.finalOutput;
  } catch (error) {
    throw toGenerationError(error);
  }

  const deck = PitchDeckSchema.safeParse(finalOutput);
  if (!deck.success) {
    throw new PitchDeckGenerationError("INVALID_OUTPUT", MESSAGES.invalidOutput, {
      cause: deck.error,
    });
  }

  return deck.data;
}
