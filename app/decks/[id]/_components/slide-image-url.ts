// Must match `images.remotePatterns` in next.config.ts: `next/image` throws during render for a
// host that is not allowed there, so anything else is rendered without an image.
const ALLOWED_IMAGE_PATHS: Record<string, string> = {
  "picsum.photos": "/seed/",
  "ik.imagekit.io": "/",
};

/**
 * Generated images (on ImageKit) are drawn slides with their words on them; Picsum images are
 * placeholder photos that still need the slide's text beside them.
 */
export function isDrawnSlideImage(imageUrl: string): boolean {
  return new URL(imageUrl).hostname === "ik.imagekit.io";
}

/** Returns the stored slide image URL if it is an https URL on an allowed host, else `null`. */
export function allowedImageUrl(imageUrl: string | null): string | null {
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
