import "server-only";

import OpenAI from "openai";

const IMAGE_MODEL = "gpt-image-1-mini";
const IMAGE_SIZE = "1024x1024";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY in .env — create one at https://platform.openai.com/api-keys",
    );
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

/** Generates one image for `prompt` and returns it as PNG bytes (gpt-image models return base64). */
export async function generateImage(prompt: string): Promise<Buffer> {
  const response = await getOpenAIClient().images.generate({
    model: IMAGE_MODEL,
    prompt,
    size: IMAGE_SIZE,
    n: 1,
  });

  const base64 = response.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error("The image model returned no image data");
  }

  return Buffer.from(base64, "base64");
}
