# Proposal

## Why

The app has no data layer: only the `prisma` CLI (`8.0.0-rc.30`) is declared, nothing is installed, and `prisma.config.ts` carries only the agent-skills block. Before any pitch-deck features can persist data, the project needs a working, type-safe connection to a PostgreSQL database (Neon) using the current Prisma ORM 8 contract-first architecture, not Prisma 6/7 patterns (`schema.prisma`, `@prisma/client`, `prisma generate`).

## What Changes

- Add the approved runtime dependencies: `@prisma/orm-postgres@8.0.0-rc.22` (the latest published façade; matches the installed `prisma-8` skill), `dotenv`, and `server-only`. No `pg`, `@types/pg`, `tsx`, or `@prisma/cli-engine` (the façade bundles `pg`; `vpx` runs scripts; `prisma/config` already re-exports `definePrismaConfig`).
- Extend `prisma.config.ts` with the `orm: ormConfig({...})` section while preserving the existing `skills: { agents: [...] }` block. `prisma orm init` is **not** run, because it would rewrite this file.
- Add a PSL data contract at `src/prisma/contract.prisma` containing only the starter `User` and `Post` models, plus its emitted artefacts `contract.json` and `contract.d.ts`.
- Add `src/prisma/db.ts`, a server-only runtime entry point that exports the typed `db` client.
- Connect the app and the Prisma CLI to Neon's direct endpoint. If `DIRECT_URL` isn't set, the direct URL is derived from `DATABASE_URL`. _(Amended during apply: Neon's pooler rejects Prisma 8's session startup settings.)_ Add `.env.example` documenting the variables; the developer supplies real values in `.env` (already git-ignored).
- Initialise the Neon database from the contract (`prisma db init`), creating tables, the contract marker, and `migrations/app/`.
- Add package scripts: `contract:emit`, and `prebuild` so `next build` always compiles against freshly emitted contract artefacts (no first-party Next.js plugin exists).
- Wire one real read query into the existing home page Server Component, compatible with `cacheComponents: true`, to prove the end-to-end round trip.

## Capabilities

### New Capabilities

- `data-access`: How the application connects to and queries its PostgreSQL database: the data contract as the single source of truth, server-only database access, connection configuration per environment, contract artefacts kept in sync with the build, and database initialisation from the contract.

### Modified Capabilities

<!-- None. The existing design-system capability is unaffected. -->

## Impact

- **Dependencies**: +`@prisma/orm-postgres` (brings `pg`, `@types/pg`; bun auto-installs peer `temporal-polyfill`), +`dotenv`, +`server-only`. `bun.lock` changes. No existing packages are upgraded.
- **Files**: `prisma.config.ts` (extended), `package.json` (dependencies + scripts), `app/page.tsx` (one Suspense-wrapped query section). New: `src/prisma/{contract.prisma,contract.json,contract.d.ts,db.ts}`, `.env.example`, `migrations/`.
- **Config not expected to change**: `tsconfig.json` (`module: esnext` + `moduleResolution: bundler` already accept JSON import attributes) and `package.json` `"type"`. These change only if emit or type-checking proves otherwise.
- **External systems**: A Neon PostgreSQL database receives the `User`/`Post` tables and Prisma's contract marker. The developer must provide Neon connection strings.
- **Runtime requirements**: Node ≥ 22.18 / 24.11 / 26 (local is v26.13). Server code only; database credentials never reach client bundles.
