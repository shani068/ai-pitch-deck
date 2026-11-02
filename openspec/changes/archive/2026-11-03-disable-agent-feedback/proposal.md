# Proposal

## Why

`experimental.agentFeedback: true` in `next.config.ts` (a create-next-app default) makes `next dev` write a managed block into `AGENTS.md` that tells every coding agent to collect Next.js issues during each task and run `npx --no-install next internal agent-feedback-instructions` before its final reply. That contradicts the project rule "never call npx directly", adds about 15 lines of always-loaded context plus an extra step to every agent session, depends on Next.js telemetry, and only benefits upstream Next.js maintainers. The owner approved disabling it.

## What Changes

- Remove `agentFeedback: true` from `next.config.ts`, and the `experimental` object that would then be empty.
- No other configuration changes. `cacheComponents`, `partialPrefetching`, the Turbopack Tailwind rule, `poweredByHeader` and the security `headers()` are unchanged.
- `next dev` no longer creates or maintains the `nextjs-agent-feedback` block in `AGENTS.md`. The block is not present today, so `AGENTS.md` needs no edit. The `nextjs-agent-rules` docs block is controlled separately and is unaffected.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

<!-- None. Developer tooling only; no user-facing behaviour changes. The change sets `skip_specs: true`. -->

## Impact

- **Code**: `next.config.ts` only (removes 3 lines).
- **Agents**: no feedback-reporting instructions or `npx` step; `AGENTS.md` stays as is.
- **Runtime/build**: none expected. `experimental.agentFeedback` only affects `next dev` agent-file generation, not rendering, routing or headers.
- **Dependencies**: none.
- **Reversible**: set `experimental.agentFeedback: true` again to restore it.
