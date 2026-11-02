# Proposal

## Why

Coding agents in this repo currently get only two generated `AGENTS.md` blocks (Next.js docs pointer, Vite+ toolchain) and no project rules: nothing about dependency approval, Tailwind v4, UI components, validation, or security. The rules the owner requires (Zod v4, shadcn/ui, OWASP-based frontend security) also reference libraries that are not installed yet, so agents would either break the "no unapproved dependencies" rule or stall. The owner has approved installing Zod v4 and initializing shadcn/ui with Radix now so the template ships with these foundations in place.

## What Changes

- Install Zod v4 (`vp add zod@^4`, currently resolves to 4.6.7) as a runtime dependency.
- Initialize shadcn/ui with the Radix base and the Nova preset (`radix-nova` style, Lucide icons, neutral base colour). This adds `components.json`, `lib/utils.ts`, and the dependencies `radix-ui`, `class-variance-authority`, `cn`, `lucide-react`, `tw-animate-css`, `shadcn`, and rewrites the theme tokens in `app/globals.css`.
- Correct two side effects of `shadcn init` found in a trial run:
  - it emits a self-referencing `--font-sans: var(--font-sans)`, which breaks the Geist font mapping;
  - it switches dark mode from following the OS (`prefers-color-scheme`) to a `.dark` class that nothing sets. **BREAKING** if left uncorrected: the starter page would lose dark mode.
- Add one concise "Project rules" section to the root `AGENTS.md`, outside the generated marker blocks, covering toolchain and dependency approval, Tailwind v4 / shadcn / Zod v4 conventions, and mandatory frontend security rules (pointing to the bundled Next.js security guides rather than duplicating them).
- Visible side effect: the body font changes from Arial to Geist Sans, because shadcn's base layer applies `font-sans` to `html` and removes the template's `font-family: Arial` override.

Out of scope (unchanged): `CLAUDE.md`, Cursor rules, nested `AGENTS.md`, new skills or docs files, the README, security headers/CSP in `next.config.ts`, `experimental.agentFeedback`, the generated OpenSpec commands/skills, and git commits.

## Capabilities

### New Capabilities

- `design-system`: The UI foundation the app's components are built on: shadcn/ui (Radix) configuration, design tokens, typography and dark-mode behaviour.

### Modified Capabilities

<!-- None: no existing specs in openspec/specs/. -->

## Impact

- **Dependencies** (approved by the owner): `zod`, `radix-ui`, `class-variance-authority`, `cn`, `lucide-react`, `tw-animate-css`, `shadcn`; `package.json` and `bun.lock` change.
- **Files**: new `components.json` and `lib/utils.ts`; modified `app/globals.css` and `AGENTS.md`. `app/layout.tsx`, `app/page.tsx` and `next.config.ts` stay untouched.
- **Build**: Tailwind stays compiled by `@tailwindcss/turbopack`. The trial run confirmed `shadcn init` adds no PostCSS config and `vp run build` succeeds.
- **Supply chain**: `cn@0.5.2` is published by shadcn (repo `shadcn-ui/cn`), but this release is one day old and the npm name was transferred from an older package; see design.md.
