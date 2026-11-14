/**
 * True for OpenAI errors that retrying cannot fix: a missing, invalid or expired key (401), a key
 * without access (403), an unknown model (404), or no remaining credit (429 `insufficient_quota`).
 * Ordinary rate limits and server errors return false, so they are still retried.
 *
 * Duck-typed on `status` and `code` because the Agents SDK may bundle its own copy of the
 * `openai` package, which would make `instanceof APIError` unreliable.
 */
export function isUnrecoverableProviderError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { status, code } = error as { status?: unknown; code?: unknown };
  if (status === 401 || status === 403 || status === 404) return true;
  return status === 429 && code === "insufficient_quota";
}
