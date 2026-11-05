import "server-only";

import {
  run,
  type GuardrailFunctionOutput,
  type InputGuardrail,
  type InputGuardrailFunctionArgs,
  type OutputGuardrail,
} from "@openai/agents";

import { deckEvaluatorAgent, type DeckEvaluation } from "./evaluator-agent";
import type { PitchDeck, PitchDeckRunContext, PitchDeckSchema } from "./schema";

export const MIN_IDEA_LENGTH = 20;

/** `outputInfo` of the input guardrail. */
export type IdeaLengthInfo = {
  length: number;
  reason: string | null;
};

/** `outputInfo` of the output guardrail: the evaluator's verdict, or a fail-closed stand-in. */
export type DeckQualityInfo = {
  approved: boolean;
  score: number | null;
  issues: string[];
};

/** Reads the user's text from either a plain string input or a list of message items. */
function extractUserText(input: InputGuardrailFunctionArgs["input"]): string {
  if (typeof input === "string") return input;

  return input
    .flatMap((item) => {
      if (!("role" in item) || item.role !== "user") return [];
      if (typeof item.content === "string") return [item.content];
      return item.content.flatMap((part) => (part.type === "input_text" ? [part.text] : []));
    })
    .join("\n");
}

/**
 * Blocks ideas that are too short to build a deck from. It runs before the model
 * (`runInParallel: false`), so a rejected idea never costs a generator call.
 */
export const businessIdeaInputGuardrail: InputGuardrail = {
  name: "Business idea minimum length",
  runInParallel: false,
  async execute({ input }) {
    const length = extractUserText(input).trim().length;
    const tooShort = length < MIN_IDEA_LENGTH;

    const outputInfo: IdeaLengthInfo = {
      length,
      reason: tooShort
        ? `Please describe your business idea in at least ${MIN_IDEA_LENGTH} characters.`
        : null,
    };

    return { tripwireTriggered: tooShort, outputInfo };
  },
};

/** Removes our delimiter tags from untrusted text so it cannot close or open a section. */
function stripDelimiters(text: string): string {
  return text.replaceAll(/<\/?(business_idea|pitch_deck)>/gi, "");
}

function buildEvaluatorInput(idea: string, deck: PitchDeck): string {
  return [
    "Grade the pitch deck below against the business idea it was generated from.",
    "",
    `<business_idea>\n${stripDelimiters(idea)}\n</business_idea>`,
    "",
    `<pitch_deck>\n${stripDelimiters(JSON.stringify(deck, null, 2))}\n</pitch_deck>`,
  ].join("\n");
}

function failClosed(issue: string): GuardrailFunctionOutput {
  const outputInfo: DeckQualityInfo = { approved: false, score: null, issues: [issue] };
  return { tripwireTriggered: true, outputInfo };
}

/**
 * Sends the generated deck and the original idea to the independent evaluator agent and
 * blocks the deck unless it is approved. The SDK does not pass the run context to the
 * evaluator, so the idea is read from the context here and passed along explicitly.
 * Any failure to evaluate blocks the deck (fail closed).
 */
export const deckQualityOutputGuardrail: OutputGuardrail<
  typeof PitchDeckSchema,
  PitchDeckRunContext
> = {
  name: "Pitch deck quality evaluation",
  async execute({ agentOutput, context }) {
    const idea = context.context?.idea?.trim();
    if (!idea) {
      return failClosed("The deck could not be evaluated because the original idea was missing.");
    }

    let verdict: DeckEvaluation | undefined;
    try {
      const result = await run(deckEvaluatorAgent, buildEvaluatorInput(idea, agentOutput));
      verdict = result.finalOutput;
    } catch (error) {
      console.error("Pitch deck evaluation failed", error);
      return failClosed("The deck could not be evaluated. Please try again.");
    }

    if (!verdict) {
      return failClosed("The deck could not be evaluated. Please try again.");
    }

    const outputInfo: DeckQualityInfo = verdict;
    return { tripwireTriggered: !verdict.approved, outputInfo };
  },
};
