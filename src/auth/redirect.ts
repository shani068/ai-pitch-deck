/** Pages that may send a visitor to sign in and expect them back afterwards. */
const RETURN_PATHS = new Set(["/new"]);

/**
 * Where to go after signing in or up. `next` comes from the URL, so anyone can set it: only an
 * exact allowlisted path is used, which rules out open redirects to other sites.
 */
export function safeNextPath(next: unknown): string {
  return typeof next === "string" && RETURN_PATHS.has(next) ? next : "/";
}
