# Tasks

## 1. Disable agent feedback

- [x] 1.1 In `next.config.ts`, remove the `experimental: { agentFeedback: true }` block, and verify `grep agentFeedback next.config.ts` finds nothing and `git diff next.config.ts` shows only those 3 lines removed (relative to the current working tree)

## 2. Integration check

- [x] 2.1 Run `vp check` and `vp run build`, and verify both pass with the page still prerendered as static
- [x] 2.2 Run `vp run dev` with telemetry enabled (the default) and verify `AGENTS.md` gains no `nextjs-agent-feedback` block, its content is byte-identical to before, and the security headers are still served (`curl -I`)

## Workflow follow-up

- Do not commit; the owner reviews all pending changes before approving a commit.
- Archive the change with `/opsx:archive` after review.
