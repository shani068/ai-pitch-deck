import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeScript } from "@/components/theme/theme-script";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for headings (see --font-heading in app/globals.css).
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s · AI Pitch Deck",
    default: "AI Pitch Deck: investor-ready pitch decks from one idea",
  },
  description:
    "Describe your business idea and get a structured, quality-reviewed pitch deck of 5 to 8 slides, each with its own image.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // ThemeScript adds `.dark` before hydration, so the server and client class lists differ.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
