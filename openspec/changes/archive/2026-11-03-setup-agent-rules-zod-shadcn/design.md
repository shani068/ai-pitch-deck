# Design

## Context

See proposal.md (Why) for motivation. These facts shape the approach:

- `AGENTS.md` holds two tool-managed blocks: `<!-- BEGIN/END:nextjs-agent-rules -->`, which `next dev` re-inserts, and `<!--VITE PLUS START/END-->`. Content outside the markers is preserved by both generators.
- Claude Code and Cursor both read the root `AGENTS.md` directly (this session loaded it without a `CLAUDE.md`), so one file serves every agent.
- Tailwind v4 is compiled by `@tailwindcss/turbopack` in `next.config.ts`; there is no PostCSS config.
- Package manager: Bun 1.4.4, driven through Vite+ (`vp`). `vp check` runs format, lint and type-check, and the pre-commit hook runs `vp check --fix` on staged files.
- A trial run of `vp dlx shadcn@latest init --base radix -p nova -y` on a scratch copy of the repo showed:
  - it detects Next.js and Tailwind v4 and adds no PostCSS config;
  - it writes `components.json` (style `radix-nova`, aliases `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`) and `lib/utils.ts` (`export { cn } from "cn"`);
  - it adds the dependencies listed in the proposal and rewrites `app/globals.css`;
  - it leaves `app/layout.tsx` untouched, which leads to the font problem below;
  - after `vp add zod@^4`, `vp run build` succeeds, and `vp check` reports only formatting issues in the two generated files.

## Goals / Non-Goals

**Goals:**

- Install Zod v4 and shadcn/ui (Radix) with the smallest correct diff, keeping current visual behaviour (OS dark mode, Geist font) apart from the intended token changes.
- One always-loaded, short project-rules section that every agent reads, with no duplication of the generated blocks or of the bundled Next.js docs.

**Non-Goals:**

- Adding any shadcn component now (components get added when a feature needs them).
- A theme toggle or `next-themes`.
- Security headers or CSP implementation (a separate change).
- Editing inside the managed marker blocks.

## Decisions

1. **Rules live in one section of the root `AGENTS.md`, placed above the managed blocks.**
   Security must apply to every task, and a linked doc is only read if an agent chooses to read it.
   - Alternatives rejected: a separate `docs/agent-guidelines.md` (may not be read), a `CLAUDE.md` importing `@AGENTS.md` (double-loads in Claude Code), `.cursor/rules` (Cursor already reads `AGENTS.md`), nested `AGENTS.md` (no directory needs different rules), and new skills (no reusable multi-step workflow).
   - Detailed security guidance is referenced from `node_modules/next/dist/docs/01-app/02-guides/` rather than copied.

2. **Run `shadcn init` non-interactively:** `vp dlx shadcn@latest init --base radix -p nova -y`.
   - Nova (Lucide icons, Geist) matches the fonts already in use.
   - Running it through `vp dlx` keeps the Vite+ rule. shadcn then installs with Bun, which it detects from `bun.lock`; that is the same package manager `vp` uses.

3. **Keep OS-driven dark mode** (preserves current behaviour, no new dependency). In `app/globals.css`, after init:
   - replace `@custom-variant dark (&:is(.dark *));` with `@custom-variant dark (@media (prefers-color-scheme: dark));`;
   - move the `.dark { ... }` token block into `@media (prefers-color-scheme: dark) { :root { ... } }`.

   Alternative: shadcn's class strategy plus `next-themes`. It allows a manual toggle but needs a new dependency and changes current behaviour; it can be adopted later if a toggle is required.

4. **Fix the font mapping in CSS, not in `layout.tsx`.** Set `--font-sans: var(--font-geist-sans);` and `--font-heading: var(--font-geist-sans);` in `@theme inline` to replace the self-referencing values init writes. This leaves `layout.tsx` unchanged, keeping app code untouched.

5. **Accept shadcn's generated dependency set as-is**, including `cn` (replacing `clsx` + `tailwind-merge`) and `shadcn` as a runtime dependency (`globals.css` imports `shadcn/tailwind.css`).
   - Alternative: hand-editing `lib/utils.ts` to use `clsx` + `tailwind-merge`. Rejected because it diverges from what future `shadcn add` output expects.

6. **Zod is pinned to major 4 with `zod@^4`.** Rules require v4 APIs and forbid `zod/v3`.

7. **The `AGENTS.md` section text** (to insert at the top of the file, above `<!-- BEGIN:nextjs-agent-rules -->`):

```md
# Project rules

## Toolchain & dependencies

- Use `vp` for every package/tool command (`vp install|add|remove|dlx`). Never call npm/pnpm/yarn/bun/npx
  directly or change `packageManager`.
- This app runs on Next.js: use `vp run dev` / `vp run build` (`vp dev`/`vp build` are Vite built-ins).
- Never add, upgrade, remove or replace a dependency without explicit approval. Prefer installed packages
  and native Next.js/React/Web APIs; if a package is truly needed, explain why and ask first.
- No other styling systems, component/UI libraries or theme libraries without approval.

## UI, styling & validation

- Tailwind CSS v4: configure in CSS (`@theme` in `app/globals.css`); no `tailwind.config.*`. Tailwind is
  compiled by `@tailwindcss/turbopack` (`next.config.ts`); do not add PostCSS config.
- shadcn/ui (Radix base, see `components.json`): reuse `components/ui` first; add components with
  `vp dlx shadcn@latest add <name>`, asking first if it would add new npm dependencies. Use the semantic
  tokens in `app/globals.css` instead of hard-coded colours; merge classes with `cn` from `@/lib/utils`.
- Dark mode follows the OS (`prefers-color-scheme`); do not switch to a class strategy or add a toggle
  without approval.
- Zod v4 only (`import { z } from "zod"`): v4 APIs such as `z.email()`, the `error` param and
  `z.treeifyError`; never Zod v3 APIs or `zod/v3`.
- Follow existing patterns; keep code simple; no speculative abstractions; leave unrelated code untouched.

## Security (every change and review)

Follow OWASP Top 10. Before finishing a task, state the relevant risks and how they were handled.

- XSS: render untrusted data through JSX; no `dangerouslySetInnerHTML` unless sanitized and justified;
  allow only http(s) or relative URLs in `href`/`src`.
- Validate untrusted input with Zod at every boundary (forms, Server Actions, route handlers, params,
  external API responses). Client validation is UX only; the server must re-validate.
- Secrets never go in client code, `NEXT_PUBLIC_*`, browser storage, URLs, logs or error messages. Mark
  server-only modules with `server-only` (not installed: ask before adding it).
- Authorize on the server for every request (Server Components/Actions, route handlers, data layer);
  client- or proxy-only role checks are not access control. Prefer HttpOnly/Secure/SameSite cookies over
  tokens in browser storage.
- CSRF: Server Actions check Origin; cookie-authenticated route handlers that change state need their
  own protection. Never change state on GET.
- Redirects: relative paths or an allowlist only. Uploads: validate type and size on the server.
- Headers/CSP: `next.config.ts` `headers()` or `proxy.ts` (nonce-based CSP forces dynamic rendering).
- If a fix needs backend or infrastructure changes, explain the risk and recommend the fix instead of
  shipping a frontend-only workaround.
- Details: `node_modules/next/dist/docs/01-app/02-guides/` (`data-security.md`, `authentication.md`,
  `content-security-policy.md`).
```

## Risks / Trade-offs

- [`cn@0.5.2` was published one day before planning, and its npm name was transferred from an older package] → The publisher is verified as shadcn, with repo `shadcn-ui/cn` and an MIT licence. Re-check the installed version and the publisher at apply time; if they don't match, stop and ask the owner (fallback: `clsx` + `tailwind-merge`).
- [`shadcn@latest` changes over time, so the real init may differ from the trial run] → Review the full diff after init. Stop and ask if it touches files beyond `package.json`, `bun.lock`, `components.json`, `lib/utils.ts` or `app/globals.css`, or if it adds a PostCSS config.
- [Starter page appearance shifts: token colours move to oklch neutrals, and the body font changes from Arial to Geist] → This is intended; verify visually in `vp run dev` in light and dark.
- [`next dev` may append a `nextjs-agent-feedback` block (`agentFeedback` is enabled)] → Expected; leave it in place. This change does not edit managed blocks.
- [A repo-wide `vp check` already fails before this change: the formatter flags 27 OpenSpec-generated Markdown files in `.claude/`, `.cursor/` and `openspec/`, and because it stops at formatting, lint never runs] → Scope check and fix to the files this change touches (`vp check --fix <paths>`), so generated tooling files are not reformatted. Whether to format or ignore those files is a separate owner decision. On the unchanged repo, `vp lint` alone passes.
- [In the scratch trial, lint failed with "Detected cycle while resolving name 'configDefaults' in 'vite-plus'"] → It reproduced in the scratch copy even with the original `package.json`, and does not occur in the real repo, so it comes from the scratch environment rather than the new dependencies. Task 2.5 confirms lint passes in the real repo after install.

## Migration Plan

Rollback: `git checkout -- package.json bun.lock app/globals.css AGENTS.md`, delete `components.json` and `lib/`, then run `vp install`.
