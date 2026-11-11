import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Static CSP: a nonce-based CSP forces dynamic rendering, which is incompatible with
// cacheComponents (Partial Prerendering). App Router streams inline scripts, so
// script-src needs 'unsafe-inline'; script-src-attr 'none' still blocks inline
// event-handler attributes (e.g. injected onerror=). 'unsafe-eval' is dev-only (React debugging).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // HSTS only takes effect over HTTPS; omitted in dev. Add "preload" only after
  // confirming every subdomain serves HTTPS.
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Slide images are fetched by the image optimizer and served from /_next/image on this origin,
  // so the CSP's `img-src 'self'` stays unchanged. Picsum's redirect to fastly.picsum.photos is
  // followed by the optimizer (default maximumRedirects: 3).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/seed/**" },
      { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
