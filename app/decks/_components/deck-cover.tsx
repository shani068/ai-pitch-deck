"use client";

import Image from "next/image";
import { useState } from "react";

import { PhotoImageIcon } from "@/src/components/icons";

/**
 * A deck's first slide as its cover, or a tinted panel when the deck has no image yet or the image
 * fails to load. Decorative: the card around it names the deck.
 */
export function DeckCover({ src }: { src: string | null }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-deck-1/45 via-deck-4/25 to-deck-2/35 text-foreground/35"
      >
        <PhotoImageIcon className="h-auto w-1/6 max-w-12 min-w-6" />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
      onError={() => setFailedSrc(src)}
      className="object-cover transition-transform duration-500 ease-apple group-hover:scale-[1.03]"
    />
  );
}
