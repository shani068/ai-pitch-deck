import "server-only";

import { headers } from "next/headers";

import { auth } from "./server";

/**
 * The signed-in session for this request, or null. Better Auth validates the signed cookie and
 * the session's expiry, so this is the server-side check every protected page and action uses.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
