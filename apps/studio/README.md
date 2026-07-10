# AN Dev Studio (`@an-groups/studio`)

The real, shipped product: a Next.js app (also packaged as a Tauri desktop app) where six AI agents plan, scaffold, implement, review, fix, and deploy a real software project from a one-line prompt. Your code never leaves your machine unless you choose a cloud AI provider — and even then, nothing is written to disk or executed without your explicit approval.

See the repo root [`README.md`](../../README.md) for the 5-minute quickstart. This file covers what's specific to this app.

## Running it

```bash
npm install          # from the repo root
npm run dev          # from the repo root, or `cd apps/studio && npm run dev`
```

Open [http://localhost:3000](http://localhost:3000). No AI provider configured yet? A first-run setup wizard appears instead of an error — see `src/components/setup/SetupWizard.tsx`.

## Desktop build (Windows, via Tauri)

```bash
npm run desktop        # dev mode, opens a native window
npm run desktop:build  # production installer
```

Output: `src-tauri/target/release/bundle/nsis/*.exe` and `.../bundle/msi/*.msi`. Requires Rust (`setup-desktop.ps1` installs it on Windows).

## Architecture

- **Agent system** (`src/agents/`) — `GlobalOrchestrator` routes a build request through six core-team agents (Planner, Scaffolder, Implementer, Reviewer, Fixer, Deployer), all sharing a `ProjectManifest`. Every action is gated through `ApprovalQueue`. See `src/agents/README.md` for the full picture, including the verify-and-fix loop (`verify/BuildVerifier.ts`).
- **Persistence** (`src/lib/db/`) — SQLite (better-sqlite3, WAL mode). Approvals, projects, activity log, agent run records, and verify-loop iterations all survive a restart.
- **Licensing** (`src/lib/licensing/`) — Free/Pro/Team plans (`plans.ts`), license-key activation against Lemon Squeezy (`LicenseManager.ts`). Gates are enforced server-side in the API routes, not just the UI.
- **AI providers** (`src/lib/ai/`) — `ProviderManager` is a fallback chain: local ANu (Ollama) first, then Groq/Cerebras/Mistral/Cloudflare/OpenRouter/Gemini/HuggingFace. Free plan is restricted to ANu only.

## Testing

```bash
npm test          # from this directory, or `npm run test --workspace=@an-groups/studio` from the root
```

Vitest, Node environment. Includes a `BuildVerifier` integration test (LLM layer mocked) demonstrating the verify-and-fix loop end to end, and `LicenseManager` tests covering the Free/Pro gate.

## Key scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run desktop` | Tauri dev (native window) |
| `npm run desktop:build` | Tauri production build |

## Known limitations

- Pending approvals, activity, and verify history all persist across restarts (SQLite), but the live agent-status org chart is still in-memory (ephemeral by design — it reflects "what's running right now", not history).
- The Lemon Squeezy store isn't provisioned yet — see [`docs/pricing-launch.md`](../../docs/pricing-launch.md) for what's left before a real checkout works.
- Android builds need the SDK/`adb` installed separately; iOS/macOS native builds require Xcode on macOS and can't run on Windows/Linux at all — the Scaffolder/Deployer still propose source files for those platforms for later use elsewhere.
