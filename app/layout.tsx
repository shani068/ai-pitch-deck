import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeScript } from "@/components/theme/theme-script";

import "./globals.css";

// One typeface for the whole app: body text and headings (see --font-sans / --font-heading in
// app/globals.css). Monospace labels use the system monospace stack, so nothing else downloads.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
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
