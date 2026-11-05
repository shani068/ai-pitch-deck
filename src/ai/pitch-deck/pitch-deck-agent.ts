import "server-only";

import { Agent } from "@openai/agents";

import { businessIdeaInputGuardrail, deckQualityOutputGuardrail } from "./guardrails";
import { PitchDeckSchema, type PitchDeck, type PitchDeckRunContext } from "./schema";

const GENERATOR_MODEL = "gpt-5.5";

// Few-shot examples. They are deliberately from different industries and business models so
// the model learns the structure and tone, not the content. Both must stay valid PitchDecks.
const B2B_SAAS_IDEA =
  "Software that helps independent veterinary clinics cut missed appointments with automated text reminders and one-tap online rebooking.";

const B2B_SAAS_DECK = {
  deckTitle: "PawPing: Fewer Empty Exam Rooms for Independent Vet Clinics",
  slides: [
    {
      title: "Missed Appointments Drain Small Clinics",
      content:
        "Independent veterinary clinics lose revenue every time a pet owner forgets an appointment. Front-desk staff spend hours on reminder calls that often go unanswered, and an empty exam slot cannot be resold at the last minute.",
      imagePrompt:
        "A quiet veterinary exam room with an empty examination table and a waiting stethoscope, soft morning light, realistic photo style",
    },
    {
      title: "Automated Reminders With One-Tap Rebooking",
      content:
        "PawPing sends friendly text reminders before each visit. Owners confirm, cancel or rebook with a single tap, and freed slots are offered to clients on a waitlist, so the schedule refills itself without staff phone calls.",
      imagePrompt:
        "A smiling pet owner on a sofa holding a phone while a relaxed golden retriever rests its head on their lap, warm home lighting",
    },
    {
      title: "A Large, Underserved Market",
      content:
        "Our initial focus is independent clinics in North America, which are often too small for enterprise practice-management suites. We will validate the serviceable market size during our pilot and expand to dental and grooming practices next.",
      imagePrompt:
        "An aerial view of a small town main street with a friendly local veterinary clinic storefront among other shops, sunny day",
    },
    {
      title: "Simple Subscription Pricing",
      content:
        "Clinics pay a flat monthly subscription per location, with no setup fee. The target is for one recovered appointment per week to cover the cost, which makes the purchase decision easy for a clinic owner.",
      imagePrompt:
        "A veterinarian and receptionist reviewing a calm, fully booked day at a tidy front desk, plants in the background, natural light",
    },
    {
      title: "Go-to-Market Through Clinic Communities",
      content:
        "We will start with a free pilot for a small group of local clinics, then grow through veterinary associations, practice-manager communities and referrals from satisfied clinics. Integrations with popular scheduling tools reduce switching effort.",
      imagePrompt:
        "A small group of veterinary professionals chatting over coffee at a friendly community meetup, candid photo style",
    },
    {
      title: "The Ask",
      content:
        "We are raising a seed round to finish integrations, run paid pilots and hire our first customer success lead. Our goal for the next 18 months is to prove retention and a repeatable sales motion with independent clinics.",
      imagePrompt:
        "A sunrise over a calm road leading toward a small town, symbolizing a clear path forward, cinematic wide shot",
    },
  ],
} satisfies PitchDeck;

const MARKETPLACE_IDEA =
  "A neighborhood marketplace where people rent out unused garage, basement and attic space to neighbors who need short-term storage.";

const MARKETPLACE_DECK = {
  deckTitle: "NookShare: Storage Space From the Neighbors Next Door",
  slides: [
    {
      title: "Storage Is Expensive and Far Away",
      content:
        "People moving, renovating or downsizing need somewhere to keep their things for a few months. Self-storage facilities are usually on the edge of town, require long contracts and charge for far more space than many people need.",
      imagePrompt:
        "A cramped apartment hallway stacked with moving boxes and a bicycle, a person looking at the clutter, realistic photo style",
    },
    {
      title: "Meanwhile, Space Sits Empty Nearby",
      content:
        "Many homes have a half-empty garage, basement corner or attic. Homeowners would happily earn extra income from that space if renting it out felt safe, simple and low-effort.",
      imagePrompt:
        "A clean, half-empty suburban garage with neatly organized shelves and open floor space, afternoon sunlight through the door",
    },
    {
      title: "NookShare Connects Neighbors",
      content:
        "Hosts list their space with photos and access rules. Renters search by distance and size, book online and pay through the platform. Clear agreements, ID checks and an item inventory make the arrangement feel trustworthy for both sides.",
      imagePrompt:
        "Two friendly neighbors shaking hands in front of an open garage with a few labeled storage boxes inside, warm golden hour",
    },
    {
      title: "Two Sides of a Local Market",
      content:
        "Demand comes from renters in dense neighborhoods with little storage. Supply comes from homeowners with spare space. We will launch city by city, measuring how quickly listings fill to decide where to expand next.",
      imagePrompt:
        "A cozy residential street of houses and small apartment buildings seen from above, trees lining the sidewalks, sunny day",
    },
    {
      title: "Commission on Every Booking",
      content:
        "NookShare takes a commission on each monthly rental and offers optional protection plans for stored items. Hosts list for free, which keeps supply growing, while renters pay less than a typical self-storage unit.",
      imagePrompt:
        "A person carrying a single storage box into a neighbor's tidy basement corner, relaxed and happy expression, soft indoor light",
    },
    {
      title: "Launch Plan",
      content:
        "We will seed supply by recruiting hosts through neighborhood groups and local community boards, then attract renters through moving companies, real-estate agents and student housing offices in our first launch city.",
      imagePrompt:
        "A community notice board in a friendly local cafe covered with colorful blank flyers, people chatting in the background",
    },
    {
      title: "The Ask",
      content:
        "We are raising a pre-seed round to build the booking and trust features, launch in one city and prove that both hosts and renters come back. Success in the first city becomes the playbook for the next ones.",
      imagePrompt:
        "A wide view of a city skyline at dawn with residential neighborhoods in the foreground, hopeful and calm atmosphere",
    },
  ],
} satisfies PitchDeck;

const GENERATOR_INSTRUCTIONS = `You are an experienced startup advisor who turns a founder's business idea into a concise, persuasive pitch deck for seed-stage investors.

## Structure
- Produce 5 to 8 slides. Use more slides only when the idea gives enough substance for them.
- Follow this order, merging or skipping slides when the idea does not support them:
  Problem, Solution, Market, Product, Business Model, Go-to-Market or Traction, Team or Ask.
- Every slide must move the investor story forward. No filler slides.

## Field rules (strict limits)
- deckTitle: 3 to 100 characters. Product name plus a short value statement.
- slide title: 3 to 80 characters. A clear claim, not a single generic word.
- slide content: 20 to 500 characters. Two to four plain sentences, specific to this idea.
- imagePrompt: 10 to 300 characters. One concrete visual scene that supports the slide.
  Never ask for text, words, numbers, logos, charts or slides in the image.

## Honesty
- Never invent traction, revenue, customer names, partners or precise market figures the idea does not give.
- Present numbers and outcomes as targets, assumptions or things to validate.
- Write in clear, confident, jargon-free English.

## Examples
These two examples show the expected structure, tone and level of detail. They come from different industries on purpose.
Do not reuse their wording, product names or industries. Build each deck only from the founder's idea.

### Example 1
Business idea: ${B2B_SAAS_IDEA}
Pitch deck:
${JSON.stringify(B2B_SAAS_DECK, null, 2)}

### Example 2
Business idea: ${MARKETPLACE_IDEA}
Pitch deck:
${JSON.stringify(MARKETPLACE_DECK, null, 2)}`;

/**
 * Generates a structured pitch deck from a business idea. The input guardrail blocks ideas
 * that are too short before the model runs, and the output guardrail has the independent
 * evaluator agent approve the deck before it is returned.
 */
export const pitchDeckAgent = new Agent<PitchDeckRunContext, typeof PitchDeckSchema>({
  name: "Pitch Deck Generator",
  model: GENERATOR_MODEL,
  instructions: GENERATOR_INSTRUCTIONS,
  outputType: PitchDeckSchema,
  inputGuardrails: [businessIdeaInputGuardrail],
  outputGuardrails: [deckQualityOutputGuardrail],
});
