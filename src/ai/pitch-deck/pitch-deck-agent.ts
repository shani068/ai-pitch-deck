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
      keyMessage: "Each missed visit leaves an empty exam room that cannot be resold.",
      highlight: "empty exam room",
      imagePrompt:
        "A tired vet standing beside an empty exam table, a wall clock and a calendar with crossed-out appointments, a small sad dog sketch",
    },
    {
      title: "Automated Reminders With One-Tap Rebooking",
      content:
        "PawPing sends friendly text reminders before each visit. Owners confirm, cancel or rebook with a single tap, and freed slots are offered to clients on a waitlist, so the schedule refills itself without staff phone calls.",
      keyMessage: "Friendly text reminders let owners confirm or rebook with one tap.",
      highlight: "rebook with one tap",
      imagePrompt:
        "A smiling pet owner on a sofa tapping a phone with a check mark bubble, a happy dog resting on their lap, small sparkles around the phone",
    },
    {
      title: "A Large, Underserved Market",
      content:
        "Our initial focus is independent clinics in North America, which are often too small for enterprise practice-management suites. We will validate the serviceable market size during our pilot and expand to dental and grooming practices next.",
      keyMessage:
        "Independent clinics are too small for enterprise suites and are left underserved.",
      highlight: "left underserved",
      imagePrompt:
        "A small friendly clinic storefront next to a giant office tower, a map pin above the clinic and a dotted path to more small clinics",
    },
    {
      title: "Simple Subscription Pricing",
      content:
        "Clinics pay a flat monthly subscription per location, with no setup fee. The target is for one recovered appointment per week to cover the cost, which makes the purchase decision easy for a clinic owner.",
      keyMessage: "A flat monthly fee per clinic, covered by one recovered visit a week.",
      highlight: "one recovered visit a week",
      imagePrompt:
        "A vet and receptionist at a tidy front desk with a full appointment book, a coin stack and an upward arrow beside them",
    },
    {
      title: "Go-to-Market Through Clinic Communities",
      content:
        "We will start with a free pilot for a small group of local clinics, then grow through veterinary associations, practice-manager communities and referrals from satisfied clinics. Integrations with popular scheduling tools reduce switching effort.",
      keyMessage: "Free local pilots first, then growth through vet associations and referrals.",
      highlight: "free local pilots",
      imagePrompt:
        "A small circle of vets chatting over coffee, dotted arrows linking them to more clinic buildings, a megaphone doodle",
    },
    {
      title: "The Ask",
      content:
        "We are raising a seed round to finish integrations, run paid pilots and hire our first customer success lead. Our goal for the next 18 months is to prove retention and a repeatable sales motion with independent clinics.",
      keyMessage: "A seed round to finish integrations, run paid pilots and prove retention.",
      highlight: "prove retention",
      imagePrompt:
        "A rocket lifting off from a clinic rooftop with a paw print on it, a winding road to a sunrise, small stars around it",
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
      keyMessage: "Self-storage is far away, needs long contracts and costs too much.",
      highlight: "costs too much",
      imagePrompt:
        "A cramped hallway stacked with moving boxes and a bicycle, a person scratching their head, a long road leading to a distant storage building",
    },
    {
      title: "Meanwhile, Space Sits Empty Nearby",
      content:
        "Many homes have a half-empty garage, basement corner or attic. Homeowners would happily earn extra income from that space if renting it out felt safe, simple and low-effort.",
      keyMessage: "Garages, basements and attics nearby sit half empty.",
      highlight: "sit half empty",
      imagePrompt:
        "A cutaway house showing a half-empty garage, basement and attic with open space outlined by dashed lines and a small coin doodle",
    },
    {
      title: "NookShare Connects Neighbors",
      content:
        "Hosts list their space with photos and access rules. Renters search by distance and size, book online and pay through the platform. Clear agreements, ID checks and an item inventory make the arrangement feel trustworthy for both sides.",
      keyMessage: "Neighbors book nearby space with ID checks and clear agreements.",
      highlight: "ID checks and clear agreements",
      imagePrompt:
        "Two neighbors shaking hands in front of an open garage with a few labeled boxes, a shield with a check mark floating above them",
    },
    {
      title: "Two Sides of a Local Market",
      content:
        "Demand comes from renters in dense neighborhoods with little storage. Supply comes from homeowners with spare space. We will launch city by city, measuring how quickly listings fill to decide where to expand next.",
      keyMessage: "Renters in dense areas meet homeowners with spare room, city by city.",
      highlight: "city by city",
      imagePrompt:
        "A street of houses and apartment blocks seen from above, map pins on several homes connected by dotted lines",
    },
    {
      title: "Commission on Every Booking",
      content:
        "NookShare takes a commission on each monthly rental and offers optional protection plans for stored items. Hosts list for free, which keeps supply growing, while renters pay less than a typical self-storage unit.",
      keyMessage: "A commission on every booking, while hosts list for free.",
      highlight: "commission on every booking",
      imagePrompt:
        "A person carrying a single box into a neighbor's basement corner, a coin with an arrow flowing to a small marketplace stall",
    },
    {
      title: "Launch Plan",
      content:
        "We will seed supply by recruiting hosts through neighborhood groups and local community boards, then attract renters through moving companies, real-estate agents and student housing offices in our first launch city.",
      keyMessage: "Recruit hosts through neighborhood groups, then reach renters through movers.",
      highlight: "neighborhood groups",
      imagePrompt:
        "A community notice board in a cafe with blank flyers, a moving truck and a megaphone doodle with arrows pointing to the board",
    },
    {
      title: "The Ask",
      content:
        "We are raising a pre-seed round to build the booking and trust features, launch in one city and prove that both hosts and renters come back. Success in the first city becomes the playbook for the next ones.",
      keyMessage: "A pre-seed round to launch one city and turn it into the playbook.",
      highlight: "the playbook",
      imagePrompt:
        "A city skyline at dawn with a rising arrow from one neighborhood to the next, a small open book and sparkles in the sky",
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
- keyMessage: 10 to 160 characters. The one short sentence drawn on the slide image, in large
  handwriting. It condenses the slide's content; keep it under 15 words, plain and specific.
- highlight: 2 to 60 characters. The two to five most important words of keyMessage, copied
  exactly from it. They are marked with a highlighter on the slide.
- imagePrompt: 10 to 300 characters. The hand-drawn sketch illustration for the right half of
  the slide: one concrete scene with people or objects from this idea, plus simple doodles such as
  arrows, check marks, map pins, coins or sparkles that show the slide's point. Describe only what
  is drawn. Never ask for text, words, numbers, logos, labeled charts or a style (the style is fixed).

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
