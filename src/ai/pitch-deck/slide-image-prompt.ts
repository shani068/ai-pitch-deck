import type { Slide } from "./schema";

export type SlideImageText = Pick<Slide, "title" | "keyMessage" | "highlight" | "imagePrompt">;

/**
 * Text quoted into the prompt: one line, and straight double quotes turned into single ones so a
 * slide's words cannot close the quote and read as extra instructions to the image model.
 */
function quotable(text: string): string {
  return text.replace(/\s+/g, " ").replaceAll('"', "'").trim();
}

/**
 * The full image prompt for one slide: a finished, hand-drawn "whiteboard explainer" slide with
 * the slide number, a script title, the key message with one highlighted phrase, and a sketch
 * illustration. The generator only writes the words and the scene; the layout and art style are
 * fixed here, so every slide in every deck has the same look.
 */
export function buildSlideImagePrompt(slide: SlideImageText, order: number): string {
  const title = quotable(slide.title);
  const keyMessage = quotable(slide.keyMessage);
  const highlight = quotable(slide.highlight);
  const number = String(order + 1).padStart(2, "0");
  // Only highlight a phrase that is really in the message; otherwise the model would add words.
  const highlightRule = keyMessage.toLowerCase().includes(highlight.toLowerCase())
    ? `Highlight the phrase "${highlight}" with a translucent mint-green marker stroke and a hand-drawn underline.`
    : "Highlight the most important phrase with a translucent mint-green marker stroke and a hand-drawn underline.";

  return `Design one finished presentation slide in a hand-drawn whiteboard explainer style, landscape.

Background: dark charcoal chalkboard with a faint square grid, softly vignetted.
Top-left corner: a small rounded tag reading "${number}".
Title, centered across the top in large white elegant handwritten script lettering:
"${title}"
Body text on the left half, in neat white handwritten print, left aligned, 2 to 4 short lines:
"${keyMessage}"
${highlightRule}
Illustration on the right half: a hand-drawn sketch with thin white ink lines and a few flat accents in mint, coral, amber and pink, with small doodles such as arrows and sparkles: ${quotable(slide.imagePrompt)}

Rules: spell every word exactly as quoted and add no other words, letters or numbers. No logos, no watermark, no photo realism. Generous margins, uncluttered, high contrast, easy to read from a distance.`;
}
