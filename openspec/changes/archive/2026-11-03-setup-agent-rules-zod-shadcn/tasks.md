# Tasks

## 1. Zod v4

- [x] 1.1 Run `vp add zod@^4` and verify `package.json` lists `zod` with a `^4` range under `dependencies`, and `node_modules/zod/package.json` reports a 4.x version

## 2. shadcn/ui (Radix)

- [x] 2.1 Run `vp dlx shadcn@latest init --base radix -p nova -y` and verify with `git status` that only `package.json`, `bun.lock`, `app/globals.css`, `components.json` and `lib/utils.ts` changed, that no `postcss.config.*` exists, and that `components.json` has `"style": "radix-nova"`. Otherwise stop and ask the owner
- [x] 2.2 Verify the added dependencies match design.md: `cn` must be published by `shadcn` from repo `shadcn-ui/cn` (check with `curl https://registry.npmjs.org/cn`); stop and ask on any mismatch
- [x] 2.3 In `app/globals.css`, restore OS-driven dark mode (design.md, Decision 3) and verify no `.dark` selector or `&:is(.dark *)` remains
- [x] 2.4 In `app/globals.css`, map `--font-sans` and `--font-heading` to `var(--font-geist-sans)` (design.md, Decision 4) and verify no `var(--font-sans)` self-reference remains
- [x] 2.5 Run `vp check --fix app/globals.css lib/utils.ts components.json` then `vp check app/globals.css lib/utils.ts components.json`, and verify format, lint and type-check pass. Do not run an unscoped `--fix`: it would reformat the OpenSpec-generated Markdown, which is out of scope
- [x] 2.6 Run `vp run build` and verify it succeeds; then in `vp run dev` verify the `design-system` spec scenarios: Geist Sans body text, token colours, and dark tokens under an emulated dark colour scheme

## 3. Agent rules

- [x] 3.1 Insert the "Project rules" section from design.md (Decision 7) at the top of `AGENTS.md`, above `<!-- BEGIN:nextjs-agent-rules -->`, and run `vp check --fix AGENTS.md`, and verify both managed blocks are byte-identical to before (`git diff AGENTS.md` shows only added lines at the top)
- [x] 3.2 Verify there's no duplication: no rule in the new section repeats the Vite+ block (`vp check`/`vp test`/`vpx` guidance) or the Next.js block, and every path it references exists (`components.json`, `lib/utils.ts`, `app/globals.css`, `next.config.ts`, the three Next.js guide files)

## 4. Integration check

- [x] 4.1 Run `git status` and verify the only changes are those in proposal.md (Impact) plus this change's OpenSpec folder; `app/layout.tsx`, `app/page.tsx`, `next.config.ts` and `README.md` must be unmodified

## Workflow follow-up

- Commit the change and the untracked `.claude/`, `.cursor/` and `openspec/` folders only when the owner asks.
- Archive the change with `/opsx:archive` after review.
- Separate follow-ups to propose: security headers/CSP, the README "Getting Started" fix, the `agentFeedback` decision, and making a repo-wide `vp check` pass by either formatting or ignoring the OpenSpec-generated Markdown.
