import type { PitchDeck, Slide } from "@/src/ai/pitch-deck/schema";

/** The fields the home page shows: the generator's structure minus image prompts. */
export type SampleDeck = Pick<PitchDeck, "deckTitle"> & {
  idea: string;
  slides: Pick<Slide, "title" | "content">[];
};

/**
 * A real deck produced by the generator during the end-to-end test, copied verbatim (title and
 * slide text). It is static, so the home page makes no model, database or image request.
 */
export const SAMPLE_DECK: SampleDeck = {
  idea: "A subscription service that delivers locally roasted coffee beans to small offices every week, with flexible plans and a tasting box for new customers.",
  deckTitle: "OfficeRoast: Better Coffee for Small Teams",
  slides: [
    {
      title: "Small Offices Settle for Stale Coffee",
      content:
        "Small teams want good coffee, but buying beans often becomes an afterthought. Grocery coffee goes stale, bulk office supplies feel generic, and someone on the team still has to remember to restock before the pot runs empty.",
    },
    {
      title: "Weekly Local Beans on a Flexible Plan",
      content:
        "OfficeRoast delivers freshly roasted local beans to small offices every week. Teams choose the quantity and roast style, pause or change plans anytime, and avoid both stale shelves and emergency coffee runs.",
    },
    {
      title: "A Focused Market of Underserved Teams",
      content:
        "The initial customer is a small office that cares about employee experience but is too small for traditional workplace coffee services. We will start in one metro area, prove repeat orders, then add nearby neighborhoods and cities.",
    },
    {
      title: "Tasting Box Makes the First Order Easy",
      content:
        "New customers can start with a tasting box of locally roasted beans. The team samples different profiles, picks favorites, and converts into a weekly subscription sized to their office habits.",
    },
    {
      title: "Recurring Revenue From Office Subscriptions",
      content:
        "Revenue comes from weekly or monthly subscriptions based on bean quantity and delivery frequency. Flexible plans reduce cancellation anxiety, while curated local roasts create a premium alternative to commodity office coffee.",
    },
    {
      title: "Launch Through Local Offices and Roasters",
      content:
        "We will acquire early customers through direct outreach to small offices, coworking spaces and local business groups. Partnering with local roasters can expand variety while giving roasters a steady wholesale channel.",
    },
    {
      title: "The Ask",
      content:
        "We are raising seed funding to build the subscription platform, run delivery pilots and sign the first roaster partners. The next milestone is proving retention, delivery economics and a repeatable sales motion in one launch market.",
    },
  ],
};
