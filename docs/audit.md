# AN Dev Studio — Architecture Audit (Phase 0)

Read-only orientation performed before the Phase 1+ refactor described in the master build prompt. Nothing in the repo was modified to produce this document.

## a) Entry points

| Entry point | How it's run | What it boots |
|---|---|---|
| `apps/studio` (Next.js 16 app) | `npm run dev` / `npm run build` / `npm run start` (root scripts delegate via `--workspace=@an-groups/studio`); `npm run desktop` / `desktop:build` for the Tauri wrapper | The real product: Next.js App Router UI + API routes. This is what end users actually run. |
| `src/studio.ts` (root) | `npm run studio` -> `tsx src/studio.ts` | `StudioKernel.boot()` -- the standalone "enterprise kernel" runtime described in (b)/(c) below. Not served over HTTP, not linked to any UI. |
| `src/index.ts` (root) | Programmatic import only | Same kernel; contains a doc comment: "For the Next.js web UI, see apps/studio/." -- a pointer in prose only, not a code dependency. |

Both root `src/` and `apps/studio` are registered as workspaces / TS projects, but only `apps/studio` is reachable by a user through the product surface (web UI, API routes, Tauri desktop shell).

## b) The two parallel agent systems, and where they diverge

**System 1 -- "Builder" (`apps/studio/src/agents/**`)**, the real, wired system behind the product:

- `GlobalOrchestrator` (top) -> ~12 `MiniOrchestrator`s (one per domain: `ui`, `backend`, `database`, `testing`, `devops`, `marketing`, `automation`; one per platform: `platform-web`, `platform-windows`, `platform-android`, `platform-ios`, `platform-macos`) -> ~48 single-responsibility `MicroAgent`s (`BaseFileAgent` or `BaseCommandAgent` subclasses).
- Every level asks the LLM (via `completeJson`/`complete` in `core/llm.ts`, backed by `ProviderManager`) to decompose work one level further.
- Every micro-agent produces exactly one `ApprovalRequest` (`file_write` or `shell_command`) via `ApprovalQueue.enqueue()` -- no agent ever touches disk or a shell directly.
- `ApprovalQueue.approveAndApply()` (`apps/studio/src/agents/core/ApprovalQueue.ts`) is the **only** place a write or command actually executes, gated on human approval via the `/api/agents/approvals/[id]/approve` route. Shell commands run through Docker (`agents/sandbox/DockerSandbox.ts`) when available, else fall back to a direct host `spawn`.
- State is in-memory only (`Map`s on `globalThis`, capped at 500 entries) -- does not survive a real process restart.
- Fully reachable from the product: `/api/agents/run`, `/api/agents/approvals/*`, and a Builder UI page consume this system exclusively.

**System 2 -- "Kernel" (root `src/**`)**, an elaborate, disconnected parallel implementation:

- `StudioKernel` (`src/core/kernel`) -- 5-phase boot sequence wiring a hand-rolled DI container (`src/core/container`), event bus (`src/core/events`), command pattern (`src/core/command`), config system (`src/core/config`), module system with health tracking (`src/core/module`), and a `SelfHealingEngine` (`src/core/healing`) that reacts to failures via an `AIRecoveryEngine`.
- A second, separate "autonomous AI" layer (`src/ai/autonomous`): `GapDetector.detectAndFix()` -> `ModuleGenerator.proposeModule()` -> `AutonomousModuleRegistry.register()/.activate()`, with only a post-hoc LLM "review" step -- **no human approval gate** analogous to `ApprovalQueue`. `ModuleGenerator.proposeModule()` is effectively a stub: its "generated code" is `JSON.stringify(result.output)`, not real source.
- A third, separate agent framework under root `src/agents/**`: `AgentRegistry`, `BaseAgent`/`ArchitectAgent`, and six "executive agents" (`StrategyAgent`, `SimulationAgent`, `GlobalOptimizationAgent`, `ResourceAllocationAgent`, `LongTermPlanningAgent`, `CrossDomainReasoningAgent`) driven by `Orchestrator`/`ExecutiveGraph`/`AdaptiveExecutiveGraph`/`SelfEvolvingExecutiveGraph`.
- A plugin system (`src/plugins`) layered on top, unrelated to either agent framework.

**Where they diverge:** zero shared code, types, or runtime. Grepped for cross-imports in both directions -- none exist (the only textual link is the doc-comment pointer above). Build/test tooling is fully partitioned too: root `tsconfig.json` explicitly excludes `apps` and `packages`; root `vitest.config.mjs`/`.ts` only covers `src/**` and `packages/**`; `apps/studio` has its own independent `tsconfig.json` and **no test runner configured at all** (no vitest config, no `test` script). The only thing tying the two trees together is the outer npm workspaces declaration and the root `type-check` script, which chains into each workspace's own `type-check` -- still two separate `tsc` programs, not one.

Roadmap says the project is at "Phase 0 -- Foundation," yet the kernel already contains functionally-complete Phase 3-5 concepts (multi-agent orchestration, autonomous module generation, self-healing, enterprise-oriented scaffolding) -- a documentation/reality mismatch, and duplicated effort versus the Builder system that actually ships.

## c) What breaks if root `src/` disappears

Based on the cross-reference search in (b), **nothing in `apps/studio` breaks** -- no file under `apps/studio/src/**` imports anything from root `src/**`. Concretely, removing root `src/` would only affect:

- `npm run studio` (the `tsx src/studio.ts` script) -- stops working, but nothing else calls it.
- Root `npm test` / `npm run type-check` / `npm run coverage` -- currently type-check/test only `src/**` (+ `packages/**`); removing `src/` would make these no-ops for the kernel portion (still fine for `packages/*` if those are populated) but wouldn't break `apps/studio`'s own `build`/`lint`/`type-check`, which are independent.
- The `src/tests/*.test.ts` files (`ModuleSystem.test.ts`, `ServiceContainer.test.ts`) -- kernel-only tests, would go with it.
- Nothing in the Next.js app, its API routes, its Builder agent system, or its UI depends on root `src/` at all.

This confirms the master prompt's framing: the root kernel is aspirational and safely isolable. Phase 1 (move it to `legacy/kernel/` and strip its build/test wiring) should be a low-risk, mechanical move.

---

*No files were modified while producing this audit.*
