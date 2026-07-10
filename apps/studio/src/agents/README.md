# AN Dev Studio — Agent Builder

Hierarchical agent system: **Global Orchestrator → six core-team agents (Planner, Scaffolder, Implementer, Reviewer, Fixer, Deployer)**, all sharing one `ProjectManifest`. Entry point is the **Builder** page (`/builder`) in the app.

## How it actually works

1. You pick a platform, a target folder on your machine, and describe what to build.
2. `GlobalOrchestrator.run()` (`core/GlobalOrchestrator.ts`) builds a `ProjectManifest` (`manifest/ProjectManifest.ts` — the file tree plus the contents of files relevant to the current step, capped to a token budget) and hands it to the **Planner**, which turns your prompt into an ordered feature/file plan.
3. The **Scaffolder** lays down the initial project skeleton (framework config, folder structure, deps manifest), with platform-specific conventions (Web/Windows/Android/iOS/macOS) folded into `core-team/platformKnowledge.ts`.
4. For each planned feature, the **Implementer** writes/edits the concrete source files — always with the shared manifest in view, so imports and paths stay consistent with what other agents already proposed — and the **Reviewer** immediately checks the diff for incoherence (broken relative imports via a static check, plus an LLM pass for style drift/missing pieces) before anything reaches a human.
5. The **Deployer** proposes run/deploy config (Dockerfile, vercel.json, CI workflow, etc.) once the project shape exists.
6. The **Fixer** isn't part of a normal build — it's invoked by the verify-and-fix loop (Phase 3, `verify/BuildVerifier.ts`) when a build/test run fails, given the error output and the manifest.
7. Every agent action — every file write or shell command — is proposed as an `ApprovalRequest`, never applied directly. The Builder page polls `/api/agents/approvals` and shows every pending request as a diff (file writes) or literal command text (shell commands), with Approve/Reject buttons.
8. Only `POST /api/agents/approvals/[id]/approve` actually writes the file or runs the command — and it runs commands inside a Docker container scoped to the project folder when Docker is available (`sandbox/DockerSandbox.ts`), falling back to running directly on the host if Docker isn't installed.

**Nothing in this system writes to disk or executes anything without a human clicking Approve.** That's enforced in one place (`core/ApprovalQueue.ts`), not something each agent has to remember to respect.

## Layout

- `core/` — framework plumbing: `ApprovalQueue`, `AgentStatusRegistry`, `GlobalOrchestrator`, `llm.ts` (provider-backed `complete`/`completeJson`), shared `types.ts`.
- `manifest/ProjectManifest.ts` — builds the shared file-tree + relevant-file-contents view every core-team agent call includes.
- `core-team/` — the six agents (`PlannerAgent`, `ScaffolderAgent`, `ImplementerAgent`, `ReviewerAgent`, `FixerAgent`, `DeployerAgent`), `platformKnowledge.ts` (per-platform scaffold/deploy notes + toolchain availability checks), and `propose.ts` (shared ApprovalQueue-enqueue helpers).
- `sandbox/DockerSandbox.ts` — Docker-based command execution used by `ApprovalQueue`.

## What's fully wired and testable today

- Global Orchestrator running Planner → Scaffolder → (Implementer → Reviewer per feature) → Deployer, all sharing one manifest per project.
- Approval queue, path-escape protection (can't write outside the target folder), Docker sandbox fallback.
- Platform-specific scaffold/deploy conventions and toolchain-availability checks for Web, Windows, Android, iOS, macOS (`core-team/platformKnowledge.ts`) — same domain knowledge the old per-platform mini-orchestrators held, now data instead of a separate agent hierarchy.
- The Builder UI page with platform picker, folder picker, plan display, and the approve/reject feed.

## What's scaffolded but NOT functional yet — by design, not oversight

- **Android**: `checkPlatformAvailability` honestly reports unavailable unless `adb` is detected (Android Studio + SDK are not installed by `setup-desktop.ps1`). Files can still be proposed for review even when unavailable.
- **iOS / macOS**: these can *never* work on a non-macOS machine — real builds need Xcode. `checkPlatformAvailability` reports this plainly rather than pretending.
- **The verify-and-fix loop** (Phase 3) — the Fixer agent exists but isn't wired to an actual build/test run yet; that's `verify/BuildVerifier.ts`.

## Known limitations to be aware of

- **In-memory approval queue.** Pending approvals live in server memory and are lost on a server restart. Fine for a single local session; Phase 4 replaces this with SQLite.
- **One file per proposal, but multiple proposals per agent call.** Agents now propose several files per call (a real improvement over the old one-file-per-micro-agent model), but each individual file is still proposed as whole-file contents, not a patch — simpler to review as a diff.
- **The LLM decides the plan.** Quality of the generated plan/code depends entirely on which provider is actually configured and answering — a local ANu model on modest hardware will produce noticeably weaker plans than Groq's larger free-tier models. Check Settings → Providers to see what's actually active.
- **Not exercised end-to-end against a live LLM in this environment.** This environment has no network access to a configured model provider, so the six agents' actual generated output hasn't been run through a real prompt end-to-end here — only type-checked, linted, and built. Start with a small prompt on the Web platform first when you do have a provider configured.
