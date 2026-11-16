# AI Pitch Deck

Describe a startup idea in a few sentences and get back a structured, investor-ready pitch deck:
5 to 8 slides written by an AI agent, checked by an independent AI reviewer, and drawn as
whiteboard-style slide images, ready to present in the browser.

## Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Commands](#commands)
- [Database](#database)
- [Security and privacy](#security-and-privacy)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

## Features

**Deck generation**

- One paragraph in (20 to 2,000 characters), a complete deck out: problem, solution, market,
  business model and the ask.
- A generator agent writes the deck as structured output, validated with Zod (5 to 8 slides, each
  with a title, content, key message, highlight and image prompt).
- Guardrails on both sides: an input guardrail rejects ideas too short to build on before any
  model call, and an output guardrail runs an independent reviewer agent that scores the deck
  against a rubric and blocks it unless it is approved.
- Every slide is drawn as a whiteboard-style image (title, key message and illustration in one
  picture), or a placeholder image in development.

**Background processing**

- Generation runs as an Inngest function with one durable step per stage: load the deck,
  generate the content, draw each slide image, save the deck.
- Each step retries on its own; unrecoverable errors (rejected ideas, invalid API keys) fail fast.
- Concurrency (3 decks at a time) and throttling (30 decks per hour) keep costs bounded.

**Presenting**

- A slide workspace: the current slide on a canvas, a thumbnail rail (a filmstrip on small
  screens), speaker notes and a toolbar.
- Keyboard navigation (arrow keys, Page Up/Down, Home/End) and native touch swiping.
- Full-screen **Present** mode with a **Spotlight** (press `S`) that dims everything but the
  area under the pointer.
- The deck page shows **Queued** and **Generating** while it works, refreshes itself, and offers
  **Try again** if generation fails.

**Accounts**

- Email and password accounts with Better Auth (sessions last 7 days).
- **My decks** lists every deck you have created, newest first.
- A clean, minimal interface with Light, Dark and System themes.

## How it works

```
 /new (idea form)
      │  Server Action: check session, validate with Zod, create a PENDING deck
      ▼
 Inngest event "deck/generate" ──▶ generate-deck function
                                     │
                                     ├─ load-deck, mark-generating
                                     ├─ generate-content
                                     │     input guardrail ─▶ generator agent (gpt-5.5)
                                     │     ─▶ structured output (Zod) ─▶ output guardrail:
                                     │        reviewer agent (gpt-5.4-mini) approves or blocks
                                     ├─ generate-slide-image-1 … n   (gpt-image-2 → ImageKit)
                                     └─ save-deck  ──▶  PostgreSQL (Neon)
                                                              │
 /decks/<id> polls until COMPLETE, then presents the slides ◀─┘
```

1. A signed-in user submits an idea at `/new`. The Server Action validates it, stores a `PENDING`
   deck owned by that user and sends an Inngest event.
2. The `generate-deck` function runs the pitch deck agent through the OpenAI Agents SDK. The
   agent's output must match the deck schema, and the reviewer agent must approve it.
3. Each slide image is generated in its own step and uploaded to ImageKit, so a failed image
   retries alone.
4. The deck page at `/decks/<id>` streams in at request time and refreshes until the deck is
   `COMPLETE` or `FAILED`.

## Tech stack

| Area            | Technology                                                               |
| --------------- | ------------------------------------------------------------------------ |
| Framework       | Next.js 16 (App Router, Cache Components, Turbopack), React 19           |
| Language        | TypeScript 5                                                             |
| AI              | OpenAI Agents SDK (`@openai/agents`): structured outputs and guardrails  |
| Models          | `gpt-5.5` (generator), `gpt-5.4-mini` (reviewer), `gpt-image-2` (slides) |
| Validation      | Zod v4                                                                   |
| Background jobs | Inngest                                                                  |
| Database        | PostgreSQL on Neon, through Prisma ORM 8 (`@prisma/orm-postgres`, RC)    |
| Auth            | Better Auth (email and password)                                         |
| Image hosting   | ImageKit                                                                 |
| UI              | Tailwind CSS v4, shadcn/ui (Radix), Pikaicons, Inter                     |
| Toolchain       | Vite+ (`vp`): Bun package manager, Oxlint, Oxfmt, Vitest                 |
| Planning        | OpenSpec                                                                 |

## Project structure

```
.
├── app/                         Next.js App Router
│   ├── page.tsx                 Home page
│   ├── (auth)/                  /sign-in and /sign-up
│   ├── new/                     Idea form (/new), signed-in users only
│   ├── decks/                   My decks (/decks), signed-in users only
│   │   └── [id]/                Deck page: status, presenter, retry (/decks/<id>)
│   └── api/
│       ├── auth/[...all]/       Better Auth endpoints
│       └── inngest/             Inngest endpoint
├── components/
│   ├── ui/                      shadcn/ui components
│   ├── site/                    Header, footer, navigation
│   ├── brand/                   Text wordmark
│   ├── theme/                   Theme script and Light / Dark / System menu
│   └── stageshow/               Vendored Stageshow kit (product preview on /new)
├── inngest/                     Inngest client and the generate-deck function
├── lib/                         OpenAI and ImageKit clients, utilities
├── src/
│   ├── ai/pitch-deck/           Generator and reviewer agents, schema, guardrails, slide images
│   ├── auth/                    Better Auth server and client, session, validation
│   ├── decks/                   Server Actions, queries, validation, polling
│   ├── prisma/                  Data contract (source of truth) and server-only client
│   └── components/icons/        Generated Pikaicons components (do not edit)
├── migrations/                  Prisma contract snapshots and refs (commit these)
├── openspec/                    Specs and archived changes
├── next.config.ts               Security headers, CSP, image hosts
├── proxy.ts                     Cookie-based redirects for signed-in pages (convenience only)
└── .env.example                 Environment variable template
```

## Getting started

### Prerequisites

- **Node.js** 22.18+, 24.11+ or 26+ (required by Prisma ORM 8)
- **Vite+ CLI (`vp`)**: see the [Vite+ guide](https://viteplus.dev/guide/)
- **A Neon PostgreSQL database** (PostgreSQL 15+): free at [neon.tech](https://neon.tech)
- **An OpenAI API key**, and an **ImageKit** account if you want generated slide images
- **The Inngest CLI** for local background jobs (see step 3 below)

### 1. Install and configure

```bash
git clone <repository-url>
cd ai_pitch_deck
vp install                  # installs dependencies and syncs the Prisma agent skills
cp .env.example .env        # then fill in the values (see Environment variables)
```

### 2. Create the database

```bash
vp run contract:emit        # generates the Prisma contract artefacts
vp exec prisma db init      # creates the tables in your Neon database
```

### 3. Run the app and the Inngest dev server

Generation runs in the background, so start two processes. `.env` needs `INNGEST_DEV=1`.

```bash
vp run dev                                         # http://localhost:3000
inngest dev -u http://localhost:3000/api/inngest   # http://localhost:8288
```

Download the `inngest` binary for your platform from the
[Inngest releases](https://github.com/inngest/inngest/releases) page (`inngest.exe` on Windows) and
put it on your `PATH`. `vp dlx inngest-cli@latest` does not work: `vp dlx` skips install scripts,
and the `inngest-cli` package downloads its binary in one. The Inngest dashboard at
[localhost:8288](http://localhost:8288) should list the app as synced under **Apps**.

### 4. Create a deck

1. Open [localhost:3000](http://localhost:3000), choose **Create a deck** and create an account.
2. Describe your idea and choose **Generate pitch deck**.
3. The deck page shows **Queued**, then **Generating**, and presents the slides when they are
   ready, usually within a few minutes.

If the Inngest dev server is not running, decks stay **Queued**; after 10 minutes the page says so
and offers **Check again**.

## Environment variables

Set these in `.env`, which is git-ignored. `.env.example` is the template.

| Variable                 | Required          | Description                                                                                   |
| ------------------------ | ----------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | Yes               | Neon connection string, pooled (`-pooler`) or direct.                                         |
| `DIRECT_URL`             | No                | Explicit direct Neon URL; overrides the one derived from `DATABASE_URL`.                      |
| `OPENAI_API_KEY`         | Yes               | Deck text always; slide images when `USE_PLACEHOLDER_IMAGES="false"`.                         |
| `USE_PLACEHOLDER_IMAGES` | No                | `"true"` (default) uses Picsum placeholders; `"false"` draws slides with OpenAI and ImageKit. |
| `IMAGEKIT_PRIVATE_KEY`   | With real images  | ImageKit private key for uploading generated slides.                                          |
| `BETTER_AUTH_SECRET`     | Yes               | Signs session cookies. At least 32 random characters: `openssl rand -base64 32`.              |
| `BETTER_AUTH_URL`        | Yes               | The app's base URL, such as `http://localhost:3000`.                                          |
| `INNGEST_DEV`            | Local development | `1` to send events to the local Inngest dev server.                                           |

> **Why direct connections?** Neon's PgBouncer pooler rejects the session settings Prisma ORM 8
> sends, so the app and the Prisma CLI connect to Neon's direct endpoint. `-pooler` is stripped
> from the host automatically (`src/prisma/connection-url.ts`), and pooling happens in the server
> process.

## Commands

Use `vp run <script>` for `package.json` scripts: `vp dev` and `vp build` are Vite built-ins and
do not start this Next.js app.

| Task                              | Command                            |
| --------------------------------- | ---------------------------------- |
| Start the dev server              | `vp run dev`                       |
| Production build (emits contract) | `vp run build`                     |
| Serve the production build        | `vp run start`                     |
| Format, lint and type-check       | `vp check` (`vp check --fix`)      |
| Run the tests                     | `vp test`                          |
| Regenerate the Prisma contract    | `vp run contract:emit`             |
| Add / remove a dependency         | `vp add <pkg>` / `vp remove <pkg>` |

## Database

The data model lives in `src/prisma/contract.prisma`, the single source of truth. It holds the
`Deck` and `Slide` models plus Better Auth's tables (`user`, `session`, `account`, `verification`,
`rateLimit`).

```
src/prisma/contract.prisma ──(prisma contract emit)──▶ contract.json + contract.d.ts
                                                              │
                                                              ▼
Neon PostgreSQL ◀──────────────── src/prisma/db.ts (server-only client) ◀── Server Components / Actions
```

- **Create the tables:** `vp exec prisma db init` (safe to run again).
- **Check for drift:** `vp exec prisma db verify`.
- **Inspect the schema:** `vp exec prisma db schema`.
- **Change the model:** edit `contract.prisma` and run `vp run contract:emit`. Apply it to a
  development database with `vp exec prisma db update`, or plan and apply a migration with
  `vp exec prisma migration plan --name <change>` and `vp exec prisma db migrate`.

Never reset or drop a database to fix a migration problem. Keep Better Auth's fields exactly as
declared, and don't use Better Auth's own `migrate` command.

Query the database only on the server (Server Components, Server Actions, route handlers):

```tsx
import { db } from "@/src/prisma/db";

const deck = await db.orm.public.Deck.select("id", "title", "status").first({ id });
```

## Security and privacy

- **Server-side checks:** creating, listing and retrying decks require a session, checked on the
  server. Only a deck's owner can retry it or see it in **My decks**.
- **Deck links are share links:** anyone with a deck's link can view it, and search engines are
  asked not to index it. The page never shows the idea you typed, but keep confidential details
  out of your idea anyway.
- **Validation:** every boundary (forms, Server Actions, route params, Inngest events, agent
  output) is validated with Zod.
- **Prompt injection:** the reviewer treats the idea and deck as material to grade, never as
  instructions, and fails closed if it cannot reach a verdict.
- **Secrets** stay on the server: the database client and AI code are marked `server-only`, and
  error messages shown to users never include provider details.
- **Headers:** a Content Security Policy and other security headers are set in `next.config.ts`;
  slide images load only from allowed hosts.
- **Costs:** set a monthly spending limit on your OpenAI project as well as relying on the
  built-in concurrency and throttle limits.

## Contributing

1. Create a branch from `main`.
2. For a non-trivial change, plan it with OpenSpec first (`/opsx:propose`). Specs live in
   `openspec/specs/`.
3. Follow the project rules in [`AGENTS.md`](AGENTS.md): use `vp` for every package command, ask
   before adding dependencies, use the semantic design tokens and Pikaicons, validate input with
   Zod, and keep database access on the server.
4. Before opening a pull request, run `vp check`, `vp test` and `vp run build`.
5. Commit the generated `src/prisma/contract.*` files and `migrations/` with contract changes.
   Never commit `.env`.

## Roadmap

- [x] Next.js 16 app shell, design system and security headers
- [x] Prisma ORM 8 + Neon PostgreSQL data layer
- [x] Deck and slide data model
- [x] AI deck generation with structured outputs, guardrails and an independent reviewer
- [x] Background generation with Inngest
- [x] Whiteboard-style slide images
- [x] Accounts, deck ownership and My decks
- [x] Presenter with full-screen mode and spotlight
- [ ] Password reset and email verification
- [ ] Production deployment (hosting and production migration workflow)

## License

This project is licensed under the [MIT License](LICENSE).
