import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/** Pages for signed-in users only; each also checks the session on the server. */
const SIGNED_IN_PATHS = new Set(["/new", "/decks"]);

/**
 * Optimistic redirects based only on whether a session cookie exists:
 * - `/new` and `/decks` without a cookie go to `/sign-in?next=<path>`;
 * - the sign-in and sign-up pages with a cookie go home, unless the URL has `next`.
 *
 * `next` is only set by those redirects. A cookie can exist while its session is gone
 * (signed out elsewhere, expired on the server); the page then sends the visitor to sign in, and
 * bouncing them back because of that cookie would loop. Showing the form to a signed-in visitor
 * who opened such a link is harmless.
 *
 * This is a convenience, never access control: these pages and the deck actions check the
 * session on the server.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(getSessionCookie(request));

  const { pathname } = request.nextUrl;
  if (SIGNED_IN_PATHS.has(pathname)) {
    if (hasSessionCookie) return NextResponse.next();
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  if (hasSessionCookie && !request.nextUrl.searchParams.has("next")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/new", "/decks"],
};
