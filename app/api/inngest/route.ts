import { serve } from "inngest/next";
import { generateDeck } from "@/inngest/functions/generate-deck";
import { inngest } from "@/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateDeck],
});
