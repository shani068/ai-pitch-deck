import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic redirects based only on whether a session cookie exists:
 * - `/new` without a cookie goes to `/sign-in?next=/new`;
 * - the sign-in and sign-up pages with a cookie go home, unless the URL has `next`.
 *
 * `next` is only set by the `/new` redirects. A cookie can exist while its session is gone
 * (signed out elsewhere, expired on the server); `/new` then sends the visitor to sign in, and
 * bouncing them back because of that cookie would loop. Showing the form to a signed-in visitor
 * who opened such a link is harmless.
 *
 * This is a convenience, never access control: `/new` and the deck actions check the session on
 * the server.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (request.nextUrl.pathname === "/new") {
    if (hasSessionCookie) return NextResponse.next();
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", "/new");
    return NextResponse.redirect(signIn);
  }

  if (hasSessionCookie && !request.nextUrl.searchParams.has("next")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/new"],
};
