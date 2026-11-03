# Tasks

## 1. Prerequisites and reference scaffold

- [x] 1.1 Confirm `.env` exists with non-empty `DATABASE_URL` (Neon pooled, `-pooler` host) and a direct connection for the CLI: `DIRECT_URL` (Neon direct), or, when it is absent, the direct URL derived from `DATABASE_URL` in `prisma.config.ts` (amended D5). Check presence and host shape only, never print values. If either is missing, stop and ask the user to add it (do not create a database). Verify: a check script reports both set and which is pooled.
- [x] 1.2 Run `vp install` so the declared `prisma@8.0.0-rc.30` CLI is installed (`postinstall` runs `prisma skills sync`). Verify: `vp exec prisma --version` prints rc.30. If the `prisma-8` skill's `library_version` changed, re-read SKILL.md and note any API differences against design.md.
- [x] 1.3 In an empty scratch directory (outside the project), run the project's CLI `prisma orm init --yes --target postgres --authoring psl --skip-install` (D1). Verify: the scratch dir contains `src/prisma/contract.prisma`, `db.ts`, `prisma.config.ts`, and its tsconfig/package.json edits. Record any difference from design D4/D6.

## 2. Dependencies

- [x] 2.1 `vp add @prisma/orm-postgres@8.0.0-rc.22 dotenv server-only` (exact pin for the façade). Verify: `package.json` gains exactly these three entries, no other dependency versions change (`git diff package.json`), and `temporal-polyfill`/`pg` resolve in `node_modules` as transitive installs.

## 3. Configuration and contract

- [x] 3.1 Extend `prisma.config.ts` per D4: add `import 'dotenv/config'` and `orm: ormConfig({ contract: './src/prisma/contract.prisma', db: { connection: process.env['DIRECT_URL'] } })`, keeping the `skills` block and `prisma/config` import unchanged. Verify: the `skills.agents` array is byte-identical in `git diff`, and `vp exec prisma skills sync` still succeeds.
- [x] 3.2 Create `src/prisma/contract.prisma` from the scratch scaffold's starter `User` + `Post` models (no app-specific models). Verify: the file matches the scratch starter contract.
- [x] 3.3 Add `.env.example` with placeholder `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) Neon URLs and a one-line comment on which consumer reads each. Verify: `git check-ignore .env` matches and `git check-ignore .env.example` does not.
- [x] 3.4 Add scripts `"contract:emit": "prisma contract emit"` and `"prebuild": "prisma contract emit"` (D9). Run `vp run contract:emit`. Verify: `src/prisma/contract.json` and `contract.d.ts` are written next to the source, and emit also succeeds with `DIRECT_URL` unset (no DB needed).
- [x] 3.5 Run `vp check`. If the emitted artefacts are flagged by lint/format, add a minimal ignore for them (do not edit the artefacts). Change `tsconfig.json`/`"type"` only if a failure proves it necessary (D2), and record why. Verify: `vp check` passes.
  - Done 2026-11-04. The emitted contract artefacts, `migrations/` and the `prisma skills sync` output (`.agents|.claude|.cursor/skills/`) are ignored by fmt and lint via one `generated` list in `vite.config.ts` (type checking still covers `contract.d.ts`). `.gitattributes` (`eol=lf`) stops Windows CRLF checkouts from failing fmt. No `tsconfig.json`/`"type"` change was needed. Also restored a corrupted `node_modules/vite-plus` with `vp install --force` (lockfile unchanged).

## 4. Database initialisation (Neon)

- [x] 4.1 Run `vp exec prisma db init` (connects via `DIRECT_URL`). Verify: success summary with operations applied and database signed; `migrations/` created. On `DRIVER.CONNECTION_FAILED`, stop and report. Never reset or drop the database.
- [x] 4.2 Run `vp exec prisma db verify` and `vp exec prisma db schema`. Verify: verify exits 0 (no drift), and the schema lists the `User` and `Post` tables plus the contract marker.
- [x] 4.3 Re-run `vp exec prisma db init`. Verify: it reports 0 operations applied (idempotent; spec _Re-running initialisation_).

## 5. Runtime client

- [x] 5.1 Create `src/prisma/db.ts` per D6 (`server-only`, `@prisma/orm-postgres/runtime` default export, `contractFromJson<Contract>` from `/static`, JSON import attribute, `url: process.env['DATABASE_URL']`). Verify: `vp check` type-checks, and `db.orm.public.User` autocompletes and type-checks in a scratch reference.
- [x] 5.2 Create temporary `scripts/db-smoke.ts` (D8): `import 'dotenv/config'`, upsert one `User` by unique email, read users back with `select(...)…all()`, print rows, `await db.close()`. Run it with `NODE_OPTIONS=--conditions=react-server vpx scripts/db-smoke.ts`. Verify: it prints the returned row(s) from Neon over the pooled URL and exits on its own. Record the exact query and rows for the final report.
- [x] 5.3 Delete `scripts/db-smoke.ts` (unless the user asks to keep it). Verify: the file is gone and no other file references it.

## 6. Next.js integration

- [x] 6.1 Add an async Server Component (e.g. `app/_components/recent-users.tsx`) per D7: `await connection()`, a bounded `db.orm.public.User` read (check chaining against the skill's `references/queries.md`), JSX-only rendering with existing design tokens, and a try/catch that shows a generic message and logs without credentials. Render it inside `<Suspense>` in `app/page.tsx`, leaving the rest of the page unchanged. Verify: `vp check` passes.
- [x] 6.2 Run `vp run dev`, request `/`. Verify: the page shows the seeded user(s) read from Neon (record the rendered rows), the static shell renders, and the server log has no errors. If the JSON import attribute fails under Turbopack, apply the Risks fallback and re-verify.
- [x] 6.3 While dev runs, edit/save `src/prisma/db.ts` 3–5 times, requesting `/` after each, then compare app connection counts (`select count(*) from pg_stat_activity where usename = current_user`) right after the reloads and again after more than 10 s. Verify: the count does not keep growing. Only if it does, add the dev-only `globalThis` client cache (D6) and re-measure.
- [x] 6.4 Temporarily set `DATABASE_URL` to an unreachable host and request `/`. Verify: the static shell renders and the data section shows the generic error with no host or credentials in page output (spec _Database unavailable at request time_). Restore `.env`.
- [x] 6.5 Temporarily import `@/src/prisma/db` from a `'use client'` file and run `vp run build`. Verify: the build fails with the `server-only` error (spec _Client code cannot import the database client_). Revert the temporary file.

## 7. Integration verification

- [x] 7.1 Run `vp run build` with database variables removed from the environment. Verify: `prebuild` regenerates the contract artefacts first (if not, apply the D9 fallback), the build succeeds without contacting the database, and `/` is reported as partially prerendered.
- [x] 7.2 Search `.next/static` for the Neon host and password substrings. Verify: no matches (spec _Credentials stay out of client output_).
- [x] 7.3 Temporarily introduce a syntax error in `contract.prisma` and run `vp run build`. Verify: the build stops with the contract error. Revert and re-emit.
- [x] 7.4 Produce the final report: files created/modified, dependencies added vs already present, commands run with results, Neon connection status, the actual query and returned rows (from 5.2 and 6.2), OWASP-relevant risks and how they were handled, and remaining manual steps (production hosting/Node version, production migration workflow).
