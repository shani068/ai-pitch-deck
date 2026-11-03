// Neon's direct (unpooled) endpoint for both the app runtime and the Prisma CLI.
// Prisma 8 sends its session settings (DateStyle, lc_monetary) as connection startup
// options, which Neon's PgBouncer pooler rejects, so nothing may connect through `-pooler`.
//
// DIRECT_URL wins when set. Otherwise the direct URL is derived from DATABASE_URL:
// Neon's direct host is the pooled host without "-pooler". Returns undefined when no
// usable URL is configured (e.g. `prisma contract emit` in CI).
export function directConnectionUrl(): string | undefined {
  const direct = process.env["DIRECT_URL"];
  if (direct) return direct;
  const configured = process.env["DATABASE_URL"];
  if (!configured) return undefined;
  try {
    const url = new URL(configured);
    url.hostname = url.hostname.replace("-pooler.", ".");
    return url.toString();
  } catch {
    return undefined;
  }
}
