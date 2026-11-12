"use client";

import { useSyncExternalStore } from "react";

/** How far the page must scroll before the bar gets its rounded background. */
const SCROLL_THRESHOLD = 8;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
const getServerScrolled = () => false;

/**
 * The header's bar. At the top of the page it has no background, so it blends into the page.
 * Once the page scrolls, a rounded, blurred card fades in behind it and the content moves
 * inwards. Every change is a CSS transition on `data-scrolled`, which reduced-motion cuts short.
 */
export function HeaderBar({ children }: { children: React.ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, getScrolled, getServerScrolled);

  return (
    <div
      data-scrolled={scrolled ? "" : undefined}
      className="flex h-14 items-center gap-2 rounded-full border border-transparent transition-[background-color,border-color,box-shadow,padding,backdrop-filter] duration-300 ease-out data-scrolled:border-border data-scrolled:bg-card/85 data-scrolled:pr-2 data-scrolled:pl-4 data-scrolled:shadow-sm data-scrolled:backdrop-blur-md sm:data-scrolled:pl-5 lg:gap-3"
    >
      {children}
    </div>
  );
}
