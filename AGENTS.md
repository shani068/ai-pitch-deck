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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
