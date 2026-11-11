import Image from "next/image";

import type { SlideForView } from "@/src/decks/queries";

// Must match `images.remotePatterns` in next.config.ts: `next/image` throws during render for a
// host that is not allowed there, so anything else is rendered without an image.
const ALLOWED_IMAGE_PATHS: Record<string, string> = {
  "picsum.photos": "/seed/",
  "ik.imagekit.io": "/",
};

function allowedImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  try {
    const url = new URL(imageUrl);
    const pathPrefix = Object.hasOwn(ALLOWED_IMAGE_PATHS, url.hostname)
      ? ALLOWED_IMAGE_PATHS[url.hostname]
      : undefined;
    if (url.protocol === "https:" && pathPrefix && url.pathname.startsWith(pathPrefix)) {
      return url.href;
    }
  } catch {
    // Not a URL at all; fall through.
  }
  console.warn("Slide image URL is not on an allowed host; rendering the slide without it");
  return null;
}

export function SlideCard({ slide, index }: { slide: SlideForView; index: number }) {
  const imageUrl = allowedImageUrl(slide.imageUrl);

  return (
    <article
      aria-labelledby={`slide-${index}-title`}
      className="grid overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={slide.imagePrompt}
          width={1024}
          height={1024}
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 40vw, 100vw"
          preload={index === 0}
          className="aspect-square w-full bg-muted object-cover"
        />
      ) : null}
      <div className="flex flex-col justify-center gap-3 p-5 sm:p-8">
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          Slide {index + 1}
        </span>
        <h2
          id={`slide-${index}-title`}
          className="text-xl font-semibold tracking-tight text-balance sm:text-2xl"
        >
          {slide.title}
        </h2>
        <p className="leading-relaxed text-pretty text-muted-foreground">{slide.content}</p>
      </div>
    </article>
  );
}
