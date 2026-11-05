# Prisma 8 – Folder and File Structure (Simple Guide)

This guide explains the Prisma 8 files in **this project**: what each file does, which ones
you edit, and which ones Prisma creates for you.

> Prisma 8 is very different from Prisma 7. There is no `schema.prisma`, no `@prisma/client`
> and no `prisma generate`. Read the comparison table at the end if you know Prisma 7.

---

## 1. The big picture in one sentence

You write your tables in **`contract.prisma`**. Prisma turns it into **`contract.json` + `contract.d.ts`**.
Your app reads those files through **`db.ts`** and runs queries with **`db.orm`**.

```
src/prisma/contract.prisma        ← YOU write your models here
        │
        │  vp run contract:emit   (runs "prisma contract emit")
        ▼
src/prisma/contract.json          ← generated (the data model as JSON)
src/prisma/contract.d.ts          ← generated (TypeScript types)
        │
        ▼
src/prisma/db.ts                  ← creates the "db" client
        │
        ▼
app/**/*.tsx (server code)        ← you write queries: db.orm.public.User...
```

The database side is separate:

```
contract.prisma changes ──► vp exec prisma db update        (quick, for dev database)
                       └──► vp exec prisma migration plan   (writes a migration in migrations/)
                            vp exec prisma db migrate       (runs it on the database)
```

---

## 2. The folder tree

```
ai_pitch_deck/
├── prisma.config.ts              ✏️  Prisma settings (where the contract is, how to connect)
├── .env                          ✏️  Your real database URL (never commit)
├── .env.example                  ✏️  Example of .env (safe to commit)
│
├── src/prisma/
│   ├── contract.prisma           ✏️  YOUR DATA MODEL – edit this one
│   ├── contract.json             🤖 Generated – do not edit
│   ├── contract.d.ts             🤖 Generated – do not edit
│   ├── db.ts                     ✏️  Creates the database client (server only)
│   └── connection-url.ts         ✏️  Builds the Neon "direct" connection URL
│
├── migrations/
│   ├── app/
│   │   ├── refs/
│   │   │   └── db.json           🤖 "Which version is my dev database at?"
│   │   └── <date>_<name>/        🤖 One folder per migration (appears after `migration plan`)
│   │       ├── migration.ts      ✏️  Only edit the placeholder parts (data changes)
│   │       ├── migration.json    🤖 Generated
│   │       └── ops.json          🤖 Generated
│   └── snapshots/
│       └── <long-hash>/          🤖 Saved copy of the contract at one point in time
│           ├── contract.json
│           └── contract.d.ts
│
├── .agents/skills/prisma-8/      🤖 Prisma docs for AI assistants (from `prisma skills sync`)
├── .claude/skills/prisma-8/      🤖 Same docs, copy for Claude
└── .cursor/...                   🤖 Same docs, copy for Cursor
```

✏️ = you write or edit it 🤖 = Prisma creates it, do not edit by hand

**Commit everything above** except `.env`. That includes the generated `contract.*` files and the
whole `migrations/` folder.

---

## 3. Every file explained

### `prisma.config.ts` (project root)

The settings file for the Prisma CLI. In Prisma 7 this information lived inside `schema.prisma`.

```ts
export default definePrismaConfig({
  skills: { agents: ["claude", "cursor", "agents"] }, // which AI tools get Prisma docs
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma", // where your data model is
    db: { connection: directConnectionUrl() }, // which database the CLI talks to
  }),
});
```

You rarely touch this file.

### `src/prisma/contract.prisma` ← the most important file

Your **data model**. This is the only place you define tables, columns and relations.
It is the "single source of truth". In Prisma 7 this was called `schema.prisma`.

```prisma
// use prisma-8

model User {
  id        Int                @id @default(autoincrement())
  email     String             @unique
  name      String?
  posts     Post[]
  createdAt DateTime           @default(now()) @onCreate(now())
  updatedAt temporal.UpdatedAt
}
```

- The first line `// use prisma-8` must stay.
- There is **no** `generator` block and **no** `datasource` block any more.
- `temporal.UpdatedAt` is the Prisma 8 way to write "updated at" (Prisma 7 used `@updatedAt`).

### `src/prisma/contract.json` and `src/prisma/contract.d.ts` (generated)

Created by `vp run contract:emit`. **Never edit them.** Run the command again instead.

- `contract.json` – your data model turned into JSON. The app loads it at runtime.
- `contract.d.ts` – TypeScript types for your models, so queries have autocomplete and type
  checks.

In Prisma 7 the generated code went into `node_modules/.prisma/client`. In Prisma 8 it sits next
to your contract and is committed to git.

`vp run build` runs `contract:emit` first by itself (the `prebuild` script), so builds are
always up to date. During development, run it yourself after every change to `contract.prisma`.

Useful types from `contract.d.ts`:

```ts
import type { Models } from "@/src/prisma/contract";

type User = Models.public_User; // all User fields + relations (posts)
```

`public` is the Postgres schema name. Every model you write lives in `public`.

### `src/prisma/db.ts`

Creates the database client named `db`. It replaces `new PrismaClient()` from Prisma 7.

- `import "server-only"` – this file can never be bundled into browser code, so your database
  password stays on the server.
- `contractFromJson<Contract>(contractJson)` – loads the generated contract.
- `postgres({ contract, url })` – creates the client. It connects only when the first query runs.
- The `devDb()` part reuses one client during `vp run dev`, so hot reload does not open a new
  connection every time you save a file.

Use it like this in Server Components, Server Actions and route handlers:

```ts
import { db } from "@/src/prisma/db";
```

### `src/prisma/connection-url.ts`

Returns the database URL. It exists because of **Neon**:

- Neon gives you a "pooled" URL (host has `-pooler`) and a "direct" URL.
- Prisma 8 sends some session settings when it connects, and Neon's pooler rejects them.
- So this file removes `-pooler` from `DATABASE_URL` and uses the direct URL instead.
  If you set `DIRECT_URL` in `.env`, it uses that.

Both `prisma.config.ts` (the CLI) and `db.ts` (the app) use this file.

### `.env` / `.env.example`

`.env` holds your real `DATABASE_URL` (and optional `DIRECT_URL`). It is in `.gitignore`.
`.env.example` shows the format with fake values.

### `migrations/` folder

This folder is about **changing the real database**. Commit all of it.

| Path                             | What it is                                                                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `migrations/app/`                | All migrations for your app. `app` is a fixed name, not your app's name.                                                                                        |
| `migrations/app/refs/db.json`    | A bookmark: "my dev database is at contract version `<hash>`". `migration plan` uses it as the starting point.                                                  |
| `migrations/app/<date>_<name>/`  | One migration. Created by `vp exec prisma migration plan --name <name>`. You have none yet because the tables were made with `db init`.                         |
| `…/migration.ts`                 | The migration steps as TypeScript, written by Prisma. You only edit it to fill a `placeholder(...)` for data changes (for example: fill a new required column). |
| `…/migration.json`, `…/ops.json` | Generated from `migration.ts`. Never edit.                                                                                                                      |
| `migrations/snapshots/<hash>/`   | A saved copy of `contract.json` + `contract.d.ts` at one version. The long hash is the version ID. Migrations and refs point to these.                          |

What is the hash? Every version of your contract gets a long ID (a hash). In `contract.d.ts`
you can see it as `StorageHash`. When you change a model, the hash changes. Prisma compares
hashes to know what changed.

If you edit `migration.ts`, run it to regenerate the JSON files:

```bash
vp node migrations/app/<date>_<name>/migration.ts
```

If you forget, you get the error `MIGRATION.HASH_MISMATCH`.

### `.agents/skills/prisma-8/`, `.claude/skills/prisma-8/`, `.cursor/...`

Prisma docs for AI coding assistants. They are copied there by `prisma skills sync`
(runs after `vp install`). They are not used by your app. Do not edit them.

---

## 4. Everyday tasks

### Add a new field or model

1. Edit `src/prisma/contract.prisma`.
2. Regenerate the contract files:
   ```bash
   vp run contract:emit
   ```
3. Update the database. Choose one:
   - **Dev database** (history does not matter):
     ```bash
     vp exec prisma db update
     ```
   - **Database with real history** (like production):
     ```bash
     vp exec prisma migration plan --name add_user_bio
     vp exec prisma db migrate
     ```
4. Commit `contract.prisma`, `contract.json`, `contract.d.ts` and `migrations/`.

### Check the database

```bash
vp exec prisma db verify     # does the database match the contract?
vp exec prisma db schema     # show what the database looks like
```

### Write a query

```ts
import { db } from "@/src/prisma/db";

// Read
const users = await db.orm.public.User.select("id", "name", "createdAt")
  .orderBy((u) => u.id.asc())
  .limit(5)
  .all();

// Read one
const user = await db.orm.public.User.where({ id: 1 }).first();
```

The pattern is always `db.orm.<schema>.<Model>`, and the schema is `public`.
A real example lives in `app/_components/recent-users.tsx`.

---

## 5. Prisma 7 vs Prisma 8 – quick translation

| Prisma 7                                          | Prisma 8 (this project)                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| `prisma/schema.prisma`                            | `src/prisma/contract.prisma`                                                |
| `generator` + `datasource` blocks in the schema   | `prisma.config.ts`                                                          |
| `npx prisma generate`                             | `vp run contract:emit` (`prisma contract emit`)                             |
| Generated client in `node_modules/.prisma/client` | `contract.json` + `contract.d.ts` next to the contract (committed)          |
| `@prisma/client`                                  | `@prisma/orm-postgres`                                                      |
| `new PrismaClient()`                              | `postgres({ contract, url })` in `db.ts`                                    |
| `prisma.user.findMany()`                          | `db.orm.public.User.all()`                                                  |
| `prisma.user.findUnique({ where: { id } })`       | `db.orm.public.User.where({ id }).first()`                                  |
| `@updatedAt`                                      | `temporal.UpdatedAt`                                                        |
| `prisma db push`                                  | `prisma db update`                                                          |
| `prisma migrate dev`                              | `prisma migration plan` + `prisma db migrate`                               |
| `prisma migrate deploy`                           | `prisma db migrate`                                                         |
| `migrations/<date>_<name>/migration.sql`          | `migrations/app/<date>_<name>/migration.ts` + `ops.json` + `migration.json` |
| `_prisma_migrations` table history                | `migrations/app/refs/*.json` + `migrations/snapshots/`                      |
| `Prisma.User` type                                | `Models.public_User` from `contract.d.ts`                                   |

---

## 6. Golden rules

1. Edit **`contract.prisma`**, then run **`vp run contract:emit`**. Always both.
2. Never edit files marked "GENERATED" (`contract.json`, `contract.d.ts`, `migration.json`,
   `ops.json`, anything in `snapshots/`).
3. Import `db` only in server code. `db.ts` has `server-only`, so the build fails if a client
   component imports it.
4. Never commit `.env`. Do commit `migrations/` and the generated `contract.*` files.
5. Never reset or drop the database to fix a Prisma problem. Use `prisma db update` for a dev
   database, or write a migration.
6. Always use the Neon **direct** URL. `connection-url.ts` handles this for you.
