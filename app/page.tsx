import type { Metadata } from "next";

import { ClosingCta } from "./_components/home/closing-cta";
import { ExampleDeck } from "./_components/home/example-deck";
import { Facts } from "./_components/home/facts";
import { Faq } from "./_components/home/faq";
import { Features } from "./_components/home/features";
import { Hero } from "./_components/home/hero";
import { HowItWorks } from "./_components/home/how-it-works";

export const metadata: Metadata = {
  description:
    "Turn one business idea into an investor-ready pitch deck: 5 to 8 slides, independently reviewed, with an image for every slide.",
};

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Facts />
      <HowItWorks />
      <Features />
      <ExampleDeck />
      <Faq />
      <ClosingCta />
    </main>
  );
}
