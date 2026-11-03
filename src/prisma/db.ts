import "server-only";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import { directConnectionUrl } from "./connection-url";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

// Neon's direct endpoint with Prisma's in-process connection pool; Neon's pooler rejects
// Prisma's session startup settings (see connection-url.ts). Next.js loads `.env` itself.
// The client connects lazily on the first query, so importing this module never opens a connection.
function createDb() {
  return postgres({ contract, url: directConnectionUrl() });
}

type Db = ReturnType<typeof createDb>;

// Development only: hot reloads re-evaluate this module, and each new client would open its
// own pool (measured: one extra idle connection per reload until the pool's idle timeout).
// Reuse one client per contract version instead; a re-emitted contract gets a fresh client
// and the old one is closed. Production evaluates the module once and never uses this cache.
const contractVersion = `${contractJson.storage.storageHash}:${contractJson.execution.executionHash}`;
const devCache = globalThis as typeof globalThis & {
  __prismaDevDb?: { version: string; db: Db };
};

function devDb(): Db {
  const cached = devCache.__prismaDevDb;
  if (cached?.version === contractVersion) return cached.db;
  if (cached) void cached.db.close().catch(() => {});
  const db = createDb();
  devCache.__prismaDevDb = { version: contractVersion, db };
  return db;
}

export const db: Db = process.env.NODE_ENV === "production" ? createDb() : devDb();
