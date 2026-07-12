# AN Dev Studio

**A local-first AI app builder. Your code never leaves your machine.**

AN Dev Studio is a desktop app (and web app) where six AI agents — Planner, Scaffolder, Implementer, Reviewer, Fixer, Deployer — plan, scaffold, implement, review, fix, and deploy a real software project from a one-line prompt. Every file write and shell command is a proposal you approve before anything touches disk; approved shell commands run inside a Docker sandbox scoped to your project folder.

This repo contains the real, shipped product (`apps/studio`) plus a frozen, disconnected earlier prototype kept for reference (`legacy/kernel`, see its README for why).

---

## 5-minute quickstart

### Prerequisites

- Node.js 22+ and npm 11+
- (Optional, for the desktop build) [Rust](https://rustup.rs/) — `apps/studio/setup-desktop.ps1` sets this up on Windows

### 1. Clone and install

```bash
git clone <this-repo-url>
cd an-dev-studio
npm install
```

### 2. Connect an AI provider

You need at least one AI provider. Pick whichever is easier:

**Without Ollama (fastest — ~1 minute):**
Get a free [Groq API key](https://console.groq.com/keys), then either:
- Add `GROQ_API_KEY=...` to `apps/studio/.env.local`, **or**
- Run the app and paste it into the first-run setup wizard / Settings → Providers.

**With Ollama (fully local, your code never touches the network):**
```bash
./anu/setup.sh        # macOS/Linux
.\anu\setup.ps1        # Windows
```
Then set `OLLAMA_ENABLED=true` in `apps/studio/.env.local`.

### 3. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If no provider is configured yet, a setup wizard walks you through option A or B above instead of failing silently.

### 4. Build something

Go to **Builder**, pick a platform, a target folder on your machine, and describe what to build. Review each proposed file/command and click Approve. Click **Verify build** to run install/build/test and auto-fix failures (opt-in auto-approve available on Pro).

---

## Plans

| | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| AI providers | Local ANu only | Full fallback chain (Groq, Cerebras, Mistral, Cloudflare, OpenRouter, Gemini, HuggingFace) |
| Verify-and-fix loop | 2 iterations | 5 iterations, auto-approve allowed |
| Support | Community | Priority |

No hosted account — Pro is unlocked with a license key from a one-time Lemon Squeezy checkout. See [`docs/pricing-launch.md`](docs/pricing-launch.md) for the full flow, and the `/pricing` page (`apps/studio/src/app/(marketing)/pricing/page.tsx`) for the public pricing page.

## Packaging a Windows desktop build

```bash
cd apps/studio
npm run desktop:build
```

Output lands in `apps/studio/src-tauri/target/release/bundle/nsis/*.exe` (installer) and `.../bundle/msi/*.msi`.

## Repository layout

- `apps/studio/` — the real product: Next.js app + agent system + Tauri desktop shell. See [`apps/studio/README.md`](apps/studio/README.md).
- `legacy/kernel/` — a frozen, earlier "enterprise kernel" prototype, not wired into the shipped product. See its README for why it's kept but not developed.
- `packages/` — small shared workspace packages (`config`, `shared`, `ui`).
- `docs/` — architecture audit, pricing/launch docs, vision/roadmap.

## Screenshots

*(placeholder — add screenshots of the Builder page, the org chart, and the approval queue here before public launch)*
