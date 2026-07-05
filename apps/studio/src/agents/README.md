# AN Dev Studio — Agent Builder

Hierarchical agent system: **Global Orchestrator → Mini-Orchestrators (one per domain/platform) → Micro-Agents (one per narrow task)**. Entry point is the **Builder** page (`/builder`) in the app.

## How it actually works

1. You pick a platform, a target folder on your machine, and describe what to build.
2. `GlobalOrchestrator.run()` (`core/GlobalOrchestrator.ts`) asks the LLM (your existing free-tier provider chain — ANu/Groq/Cerebras/OpenRouter/Gemini/HuggingFace) to break the request into steps, each routed to one mini-orchestrator.
3. Each mini-orchestrator (`BaseMiniOrchestrator.ts`) asks the LLM to break its step into sub-tasks for its own micro-agents.
4. Each micro-agent generates one file's contents or one shell command, and **enqueues it as an `ApprovalRequest`** — it never touches disk or a shell directly.
5. The Builder page polls `/api/agents/approvals` and shows every pending request as a diff (file writes) or literal command text (shell commands), with Approve/Reject buttons.
6. Only `POST /api/agents/approvals/[id]/approve` actually writes the file or runs the command — and it runs commands inside a Docker container scoped to the project folder when Docker is available (`sandbox/DockerSandbox.ts`), falling back to running directly on the host if Docker isn't installed.

**Nothing in this system writes to disk or executes anything without a human clicking Approve.** That's enforced in one place (`core/ApprovalQueue.ts`), not something each agent has to remember to respect.

## What's fully wired and testable today

- Global Orchestrator, all `BaseMiniOrchestrator`/`BaseFileAgent`/`BaseCommandAgent` plumbing
- Approval queue, path-escape protection (can't write outside the target folder), Docker sandbox fallback
- Mini-orchestrators: **UI** (component/layout/styling), **Backend** (API routes/business logic), **Database** (schema/migrations), **Testing** (unit tests/test runner), **DevOps** (dependency install/build), **Marketing** (copy), **Automation** (scripts)
- Platform mini-orchestrators: **Web** (always available — just needs Node) and **Windows** (available once Rust/Cargo is installed, which `setup-desktop.ps1` handles)
- The Builder UI page with platform picker, folder picker, plan display, and the approve/reject feed

## What's scaffolded but NOT functional yet — by design, not oversight

- **Android** mini-orchestrator: same interface, `isAvailable()` honestly reports unavailable unless `ANDROID_HOME`/`adb` are detected (Android Studio + SDK are not installed by `setup-desktop.ps1`). It can still propose Gradle/manifest files for review even when unavailable.
- **iOS / macOS** mini-orchestrators: these can *never* work on a Windows machine — real builds need Xcode, which only runs on macOS. `isAvailable()` reports this plainly rather than pretending. Kept in the codebase so the org-chart shape is uniform and so a Mac user (or CI runner) could enable them later.
- **Deployment pipelines** (beyond a local build command) and **image/asset generation** for Marketing are not built yet — noted inline in those mini-orchestrators' descriptions.

## Known limitations to be aware of

- **Untested by me.** This was written in a sandbox with no network access to run `npm install`/build/test — I could not execute any of this code. Treat it as a first real implementation to run, not a verified one. Start with a small prompt on the Web platform first.
- **In-memory approval queue.** Pending approvals live in server memory and are lost on a server restart. Fine for a single local session; would need a real store (SQLite/file-backed) if you want approvals to survive restarts.
- **One file per action.** Micro-agents propose whole-file contents, not patches — simpler to review as a diff, but means large existing files get fully regenerated rather than surgically edited. Fine for scaffolding new projects; less fine for editing a big existing file.
- **The LLM decides the plan.** Quality of the generated plan/code depends entirely on which provider is actually configured and answering — a local ANu model on modest hardware will produce noticeably weaker plans than Groq's larger free-tier models. Check Settings → Providers to see what's actually active.
