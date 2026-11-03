# Design

## Context

See `proposal.md` for motivation. Current state, verified by inspection:

- **Packages**: `package.json` lists `prisma@8.0.0-rc.30` (CLI) only. `node_modules` is absent, and `bun.lock` has no Prisma entries. Toolchain rules (AGENTS.md): every package command goes through `vp`; scripts run with `vpx`; no unapproved dependencies.
- **Versions**: the npm registry has `@prisma/orm-postgres` `latest` = `8.0.0-rc.22`. CLI `rc.30` depends on `@prisma/orm-toolchain@8.0.0-rc.22`, so CLI and ORM are versioned independently and are compatible. The installed `prisma-8` skill targets `rc.22`. `prisma/config` re-exports `definePrismaConfig` from `@prisma/cli-engine`.
- **Façade contents**: `@prisma/orm-postgres` depends on `pg` and `@types/pg`. It has a required peer `temporal-polyfill` (bun auto-installs it) and an optional peer `typescript >=5.9` (lockfile has 5.9.3).
- **Existing config**: `prisma.config.ts` holds `definePrismaConfig({ skills: { agents: [...] } })`, and `postinstall` runs `prisma skills sync`.
- **Next.js 16.4.3** with `cacheComponents: true`, Turbopack, and a static CSP. There is no `src/` directory; `app/` is at the root and the `@/*` alias maps to the root. `tsconfig` uses `module: esnext`, `moduleResolution: bundler`, `resolveJsonModule: true`.
- **No Next.js plugin**: the skill states there is no first-party Next.js/Turbopack contract-emit plugin. The Vite+ toolchain here does not serve the app, so the Vite plugin does not apply.
- **Docs**: the user-supplied link (`add-to-existing-project/postgresql`) is the brownfield path (`contract infer` + `db sign`). For an empty database the docs route to `quickstart/existing-app/postgresql` (`db init`), which this design follows. Both pages install `tsx`; this project uses `vpx` instead.

## Goals / Non-Goals

**Goals:**

- Wire Prisma ORM 8 into the existing app by hand, in the layout `prisma orm init` would produce, without running `orm init` in the project.
- Prove a real database round trip against Neon, from both a one-off script and the running app.

**Non-Goals:**

- Application-specific models, authentication, Server Actions, or any write path in the UI.
- Production deployment, CI pipelines, and production migration workflow (`migration plan` / `db migrate`). This change only initialises the development database.
- Middleware (lints, budgets, cache), read replicas, pgvector, or other extensions.
- Prisma Composer / Compute (the Next.js guide's deploy target).

## Decisions

### D1. Hand-wire, using a scratch `orm init` as the reference

`prisma orm init` rewrites `prisma.config.ts` (losing `skills:`), changes `tsconfig.json` (`module: preserve`) and `package.json` (`"type": "module"`), and installs packages itself (`@prisma/cli-engine`, `@types/node`, `prisma@latest`). Instead, run `orm init --yes --target postgres --authoring psl --skip-install` in an **empty scratch directory** with the project's CLI. Then copy only its starter `contract.prisma` and compare its `db.ts`/config against the plan.

- _Alternative_: run `orm init` in place and repair the damage. Rejected: it is destructive to existing config and installs unapproved packages.
- _Alternative_: write everything from the skill alone. Rejected: the scratch scaffold is the authoritative, version-exact starter contract and costs nothing.

### D2. Keep `tsconfig.json` and `package.json` `"type"` unchanged unless proven necessary

`module: esnext` + `moduleResolution: bundler` already permit `import … with { type: 'json' }`, and Next compiles TS itself. The CLI loads `prisma.config.ts` on its own. Change these only if `contract emit`, `vp check`, or `next build` fails, and record the reason.

### D3. File layout: `src/prisma/`

Follows the canonical layout the skill's checklist requires and the docs scaffold:

```
prisma.config.ts                 (root, extended)
src/prisma/contract.prisma       (authored)
src/prisma/contract.json         (emitted, committed)
src/prisma/contract.d.ts         (emitted, committed)
src/prisma/db.ts                 (runtime entry)
migrations/                      (written by db init, committed)
```

Next ignores `src/app` when root `app/` exists, so `src/prisma` does not affect routing. Emitted artefacts are committed so type-checking works on a fresh clone before any emit. `prebuild` re-emits regardless. Application code imports `@/src/prisma/db`.

- _Alternative_: `lib/prisma/` (matches the existing `lib/`). Rejected: deviates from the skill and docs, which every future Prisma command and reference assumes.

### D4. `prisma.config.ts` — envelope form, skills preserved, direct URL

```ts
import "dotenv/config";
import { definePrismaConfig } from "prisma/config"; // existing import, kept
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  skills: { agents: ["claude", "cursor", "agents", "devin"] }, // unchanged
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: { connection: process.env["DIRECT_URL"] }, // no `!`: emit must work without it
  }),
});
```

**Amended after apply (user request):** `"devin"` was removed from `skills.agents` and the generated `.devin/` skill folder was deleted, because the Devin editor isn't used. The list is now `["claude", "cursor", "agents"]`. `prisma skills sync` no longer recreates `.devin/`.

`dotenv/config` is required here: nothing else loads `.env` for the CLI. Leaving out the non-null assertion keeps `contract emit` (and therefore `prebuild`) working in environments with no database variables. `db.connection` is optional in `ormConfig`.

### D5. Neon: pooled URL for the app, direct URL for the CLI

`ormConfig` has a single `db.connection` and no `directUrl`. The split is made by which variable each consumer reads:

| Variable       | Neon endpoint                                       | Read by                                                                                  |
| -------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `DATABASE_URL` | pooled (`-pooler` host, PgBouncer transaction mode) | `src/prisma/db.ts` (app runtime)                                                         |
| `DIRECT_URL`   | direct                                              | `prisma.config.ts` (CLI: `db init`, `db verify`, future `migration plan` / `db migrate`) |

**Superseded during apply: the app also uses the direct endpoint.** Prisma 8 rc.22 sends its target session settings (`DateStyle=ISO`, `lc_monetary=C`) as `options` startup parameters on every connection from a pool it creates. Neon's PgBouncer pooler rejects them: `08P01 unsupported startup parameter in options: lc_monetary`, which surfaces as `CONTRACT.MARKER_READ_FAILED`. No setting turns this off. There was an alternative: give Prisma our own `pg.Pool`, so it applies the settings with `set_config` after connecting. It was rejected because it needs `pg` as an unapproved direct dependency, and through transaction pooling the settings land on shared server connections and need not persist. So `src/prisma/connection-url.ts` exports one `directConnectionUrl()` that both `prisma.config.ts` and `db.ts` use. Pooling happens in-process through the `pg.Pool` Prisma owns. Revisit when choosing a serverless deployment (see Open Questions).

**Amended during apply:** `DIRECT_URL` is optional. When it is unset, `prisma.config.ts` derives the direct URL from `DATABASE_URL` by removing `-pooler` from the host (Neon's documented naming). This means the developer only has to provide one secret, and the CLI still never goes through the pooler. An explicit `DIRECT_URL` always wins.

Rationale: DDL and Prisma's contract-marker locking are session-oriented and should not run through transaction pooling. Request traffic benefits from the pooler. Both URLs use `sslmode=require`. `.env.example` documents both with placeholders; the developer writes real values into `.env` (already git-ignored by `.env*`), and they are never pasted into chat or logs.

- _Alternative_: one direct URL for everything. Simpler, but it forgoes Neon's pooler for app traffic. Acceptable fallback if pooled queries misbehave (see Risks).

### D6. `src/prisma/db.ts` — server-only, lazy, single client

```ts
import "server-only";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);
export const db = postgres({ contract, url: process.env["DATABASE_URL"] });
```

- `server-only` makes any client-component import a build error (spec: _Database access is server-only_).
- No `dotenv` import: Next loads `.env` natively, and the docs' `import 'dotenv/config'` would be redundant inside Next.
- `Contract` is named once, on `contractFromJson` (Prisma 8 API; not `postgres<Contract>(…)` and not `@prisma/client`).
- The client connects lazily on first query, so importing it during build costs nothing.
- **Dev hot reload**: module re-evaluation creates a new client, but each pool connects only on first query, and `pg.Pool` closes idle connections after 10 s by default. Measure first (task 6.3). Only if the open connection count grows, add a development-only `globalThis` cache of the client. This is a Next.js dev-reload concern, not a Prisma API. The cache is skipped in production.

### D7. Page query: Suspense + `connection()` under Cache Components

With `cacheComponents: true`, uncached data access outside `<Suspense>` fails the build, and an unmarked query would be attempted during prerender. `app/page.tsx` stays a static shell. A new async Server Component (colocated, e.g. `app/_components/recent-users.tsx`) does three things:

1. `await connection()` (from `next/server`) to mark the subtree request-time, so the build never touches the database.
2. Reads a small, bounded list (`db.orm.public.User.select('id', 'email', …)` with a limit; exact chaining verified against `references/queries.md`).
3. Catches errors and renders a generic message, logging server-side without the connection string.

It is rendered inside `<Suspense fallback=…>` in the existing page, using existing design tokens. Data is rendered through JSX only (XSS). No writes on GET.

- _Alternative_: `'use cache'` on the query. Rejected for the proof: it would hide whether the live connection works and complicates freshness.

### D8. Seeding / round-trip proof via a temporary `vpx` script

Writing from the page would change state on GET (forbidden by project rules). A temporary `scripts/db-smoke.ts` runs the skill's "first arc": `import 'dotenv/config'`, upsert one `User` by unique email, read users back, `await db.close()`. Because `db.ts` imports `server-only` (which throws outside the `react-server` condition), the script runs with `NODE_OPTIONS=--conditions=react-server vpx scripts/db-smoke.ts`. It is deleted after verification, unless the user asks to keep it as a `db:smoke` script.

### D9. Scripts

```json
"contract:emit": "prisma contract emit",
"prebuild": "prisma contract emit"
```

`prebuild` is the skill's documented Next.js workaround. If `vp run build` does not run `pre*` lifecycle scripts, fall back to `"build": "prisma contract emit && next build"`. No `db:*` convenience scripts. Commands run through `vp exec prisma …`.

## Risks / Trade-offs

- **[Turbopack rejects `with { type: 'json' }`]** → Fall back to a plain `import contractJson from './contract.json'` (`resolveJsonModule` is on), and confirm `contractFromJson` still type-checks.
- **[Neon pooler incompatibility] Realised:** the pooler rejects Prisma's startup options → App and CLI both use the direct endpoint (D5, superseded note).
- **[`pg` sslmode semantics]** Recent `pg-connection-string` versions warn that `sslmode=require` will change meaning → Accept the warning for now. If it is noisy, use Neon's recommended `sslmode=require&channel_binding=require` or `sslmode=verify-full`.
- **[`server-only` blocks scripts]** → Handled by `--conditions=react-server` (D8). If `vpx` does not pass `NODE_OPTIONS`, run the smoke script through `vp node` with the same flag.
- **[Linting/formatting generated files]** `vp check` may flag `contract.d.ts` / `contract.json` → Exclude the emitted artefacts from lint/format (minimal ignore entry) rather than editing them.
- **[`postinstall` skills sync rewrites skill files]** The first install refreshes `.claude/skills` etc. → Expected and desired. Re-read the skill if its `library_version` changes.
- **[Dev pool growth]** → Measured before adding any cache (D6).
- **[Release-candidate APIs]** `rc.22` APIs may still change → Pin `@prisma/orm-postgres` exactly. Future upgrades follow `references/upgrade-app.md`.

## Migration Plan

1. Developer creates a Neon project/branch and writes `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) into `.env`.
2. Apply the tasks: dependencies → config → contract → emit → `db init` (against `DIRECT_URL`) → `db verify` → smoke script → page integration → build check.
3. Commit `src/prisma/*`, `migrations/`, config, and scripts.

**Rollback**: revert the commit and `vp remove` the three packages. The Neon database is left as is: never reset or drop it. Its tables are harmless, and a future `db update`/migration can reconcile it.

## Open Questions

- Production hosting (Vercel, Prisma Compute, other) and the production Node version (must be ≥ 22.18 / 24.11 / 26). Deferrable: affects only a later deployment change. On a serverless host with many instances, direct connections can exhaust Neon's connection limit. That change must pick a pooler-compatible path, such as a session-mode pooler, a later Prisma release that tolerates PgBouncer, or `postgresServerless`.
- Whether to keep `scripts/db-smoke.ts` as a permanent `db:smoke` health check (default: delete after verification).
