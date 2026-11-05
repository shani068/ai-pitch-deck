import "server-only";

import { z } from "zod";

import { uploadImage } from "@/lib/imageKit";
import { generateImage } from "@/lib/openai";

// Matches the 1024x1024 size of generated images, so both modes have the same aspect ratio.
const PLACEHOLDER_SIZE = 1024;

const PlaceholderFlagSchema = z
  .stringbool({ truthy: ["true"], falsy: ["false"], case: "sensitive" })
  .default(true);

/**
 * Whether slide images are Picsum placeholders (`USE_PLACEHOLDER_IMAGES=true`, the default when
 * unset) or generated with OpenAI and hosted on ImageKit (`USE_PLACEHOLDER_IMAGES=false`).
 * Read on every call, so an invalid value fails image requests instead of the module import.
 */
export function placeholderImagesEnabled(): boolean {
  const flag = PlaceholderFlagSchema.safeParse(process.env.USE_PLACEHOLDER_IMAGES);
  if (!flag.success) {
    throw new Error('USE_PLACEHOLDER_IMAGES must be "true" or "false" when set');
  }
  return flag.data;
}

/** A Picsum image seeded by deck and position, so the same slide always gets the same image. */
export function placeholderImageUrl(deckId: string, order: number): string {
  const seed = encodeURIComponent(`${deckId}-${order}`);
  return `https://picsum.photos/seed/${seed}/${PLACEHOLDER_SIZE}/${PLACEHOLDER_SIZE}`;
}

type SlideImageInput = {
  deckId: string;
  order: number;
  imagePrompt: string;
};

/**
 * Returns an image URL for one slide using the configured mode. Generated images are stored at a
 * path derived from the deck and position, so a retried upload replaces the earlier file.
 */
export async function generateSlideImage({
  deckId,
  order,
  imagePrompt,
}: SlideImageInput): Promise<string> {
  if (placeholderImagesEnabled()) {
    return placeholderImageUrl(deckId, order);
  }

  const image = await generateImage(imagePrompt);
  return uploadImage(image, { folder: `/decks/${deckId}`, fileName: `slide-${order}.png` });
}
