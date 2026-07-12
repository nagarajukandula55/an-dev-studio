# Legacy Kernel (frozen)

This directory holds the original root `src/` "enterprise kernel" — `StudioKernel`, a hand-rolled DI
container, event bus, command pattern, config system, module system, `SelfHealingEngine`, the
`GapDetector`/`ModuleGenerator` autonomous-module layer, and an "executive agents" orchestration
graph (`StrategyAgent`, `SimulationAgent`, `GlobalOptimizationAgent`, etc.).

## Why it's frozen

Per `docs/audit.md` (Phase 0 audit), this kernel was built as a parallel, aspirational agent system
that was never wired into the real product. `apps/studio` (the Next.js app) is the actual product
users run, with its own independent, fully-functional multi-agent "Builder" system
(`GlobalOrchestrator` → `MiniOrchestrator`s → `MicroAgent`s, gated through `ApprovalQueue`, executed
in a Docker sandbox). The audit found **zero cross-imports** in either direction between this kernel
and `apps/studio` — moving or deleting this code cannot break the shipped product.

Rather than maintain two disconnected "multi-agent" implementations, Phase 1 of the rebuild
consolidates all agent work into `apps/studio` and freezes this kernel here for reference. It is
excluded from the root build, lint, and test pipelines (see root `package.json`, `tsconfig.json`,
`vitest.config.mjs`/`.ts`).

## Status

- Not built, linted, or tested as part of `npm run build|lint|test` at the repo root.
- Not imported by `apps/studio` or any other active package.
- Kept for historical reference / potential future salvage of ideas (e.g. the executive-agent
  concepts may inform a future planning feature), not for active development.
