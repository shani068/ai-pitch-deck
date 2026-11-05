import { NonRetriableError } from "inngest";

import { generatePitchDeck, PitchDeckGenerationError } from "@/src/ai/pitch-deck/service";
import { generateSlideImage } from "@/src/ai/pitch-deck/slide-image";
import { db } from "@/src/prisma/db";

import { deckGenerate, inngest } from "../client";

const FAILED_MESSAGE = "The pitch deck could not be generated. Please try again later.";

/** Validates the event payload on receipt; the event schema is not trusted to have run on send. */
function parseDeckId(data: unknown): string | null {
  const result = deckGenerate.schema.safeParse(data);
  return result.success ? result.data.deckId : null;
}

/**
 * Generates the deck content. Rejections are non-retriable; other failures are retried. Only the
 * error's safe message leaves the step: Inngest stores thrown errors, including `cause`, which can
 * hold the idea, the deck or provider error text. The cause is logged on the server instead.
 */
async function generateContent(idea: string) {
  try {
    return await generatePitchDeck(idea);
  } catch (error) {
    if (!(error instanceof PitchDeckGenerationError)) throw error;

    console.error("Pitch deck generation failed", error.code, error.cause);
    if (error.code === "INPUT_REJECTED" || error.code === "QUALITY_REJECTED") {
      throw new NonRetriableError(error.message);
    }
    throw new Error(error.message);
  }
}

export const generateDeck = inngest.createFunction(
  {
    id: "generate-deck",
    triggers: [deckGenerate],
    // Inngest skips a repeated event for the same deck for 24 hours.
    idempotency: "event.data.deckId",
    // Runs once, after the run failed without retrying or used all its retries. FAILED is only
    // written here, so a deck is never marked failed while a retry is still pending.
    onFailure: async ({ event, error, step }) => {
      const deckId = parseDeckId(event.data.event.data);
      if (!deckId) return;

      // Only messages this workflow wrote from a safe source are thrown as NonRetriableError.
      const errorMessage = error.name === "NonRetriableError" ? error.message : FAILED_MESSAGE;

      await step.run("mark-failed", () =>
        db.orm.public.Deck.where({ id: deckId }).update({ status: "FAILED", errorMessage }),
      );
    },
  },
  async ({ event, step }) => {
    const deckId = parseDeckId(event.data);
    if (!deckId) {
      throw new NonRetriableError("The deck id is missing or invalid.");
    }

    const deck = await step.run("load-deck", async () => {
      const row = await db.orm.public.Deck.select("id", "idea", "status").first({ id: deckId });
      if (!row) {
        throw new NonRetriableError("The deck could not be found.");
      }
      return row;
    });

    if (deck.status === "COMPLETE") {
      return { deckId, skipped: true };
    }

    await step.run("mark-generating", () =>
      db.orm.public.Deck.where({ id: deckId }).update({
        status: "GENERATING",
        errorMessage: null,
      }),
    );

    // Memoized: a later retry neither pays for the model calls again nor gets a different deck.
    const pitchDeck = await step.run("generate-content", () => generateContent(deck.idea));

    // One step per slide, one at a time: each image retries on its own and stays under the image
    // model's rate limits. Generating and uploading share a step because a Buffer cannot be
    // passed between steps; only the URL is returned.
    const imageUrls: string[] = [];
    for (const [order, slide] of pitchDeck.slides.entries()) {
      const imageUrl = await step.run(`generate-slide-image-${order}`, () =>
        generateSlideImage({ deckId, order, imagePrompt: slide.imagePrompt }),
      );
      imageUrls.push(imageUrl);
    }

    // Replacing the slides makes a retried save idempotent, and one transaction means the title,
    // the slides and COMPLETE become visible together.
    await step.run("save-deck", () =>
      db.transaction(async (tx) => {
        await tx.orm.public.Slide.where({ deckId }).deleteAll();
        await tx.orm.public.Slide.createAndCount(
          pitchDeck.slides.map((slide, order) => ({
            deckId,
            order,
            title: slide.title,
            content: slide.content,
            imagePrompt: slide.imagePrompt,
            imageUrl: imageUrls[order],
          })),
        );
        await tx.orm.public.Deck.where({ id: deckId }).update({
          title: pitchDeck.deckTitle,
          status: "COMPLETE",
          errorMessage: null,
        });
      }),
    );

    return { deckId, slides: pitchDeck.slides.length };
  },
);
