"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId =
  | "general"
  | "ai-agents"
  | "anu"
  | "providers"
  | "plan"
  | "appearance"
  | "notifications"
  | "keyboard"
  | "deployment"
  | "about";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ProviderConfig {
  id: string;
  emoji: string;
  label: string;
  description: string;
  envVar: string;
  freeTierNote: string;
  getKeyUrl: string;
  // Optional second field for providers that need more than an API key to
  // form requests (e.g. Cloudflare Workers AI needs an account id alongside
  // its token). Rendered as a small extra input under the main key field.
  extraField?: { envVar: string; label: string; placeholder: string };
}

interface ProviderState {
  keyValue: string;
  extraValue: string;
  savedInApp: boolean;
  fromEnv: boolean;
  saving: boolean;
  testing: boolean;
  testResult: "success" | "error" | null;
  saveSuccess: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "⚙️" },
  { id: "ai-agents", label: "AI & Agents", icon: "🤖" },
  { id: "anu", label: "ANu", icon: "🧠" },
  { id: "providers", label: "Providers", icon: "🔌" },
  { id: "plan", label: "Plan & License", icon: "💳" },
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "keyboard", label: "Keyboard", icon: "⌨️" },
  { id: "deployment", label: "Deployment", icon: "🚀" },
  { id: "about", label: "About", icon: "ℹ️" },
];

const PROVIDERS: ProviderConfig[] = [
  {
    id: "anu-ollama",
    emoji: "🧠",
    label: "ANu (Ollama)",
    description: "In-house AI via Ollama — 100% local, zero API cost, full privacy",
    envVar: "OLLAMA_HOST",
    freeTierNote: "Free — runs locally on your machine",
    getKeyUrl: "https://ollama.ai/download",
  },
  {
    id: "groq",
    emoji: "⚡",
    label: "Groq",
    description: "Blazing fast inference — 300+ tokens/sec on Llama, Mixtral and more",
    envVar: "GROQ_API_KEY",
    freeTierNote: "Free tier: 30 req/min, 14,400 req/day",
    getKeyUrl: "https://console.groq.com/keys",
  },
  {
    id: "cerebras",
    emoji: "🔥",
    label: "Cerebras",
    description: "World's fastest AI inference — wafer-scale chip technology",
    envVar: "CEREBRAS_API_KEY",
    freeTierNote: "Free tier available — sign up for access",
    getKeyUrl: "https://cloud.cerebras.ai",
  },
  {
    id: "openrouter",
    emoji: "🔀",
    label: "OpenRouter",
    description: "Unified gateway to 200+ models — GPT-4, Claude, Gemini, Llama",
    envVar: "OPENROUTER_API_KEY",
    freeTierNote: "Free models available, pay-as-you-go for premium",
    getKeyUrl: "https://openrouter.ai/keys",
  },
  {
    id: "gemini",
    emoji: "✨",
    label: "Google Gemini",
    description: "Google's multimodal AI — vision, audio, code, long context",
    envVar: "GOOGLE_AI_API_KEY",
    freeTierNote: "Free tier: 15 req/min with Gemini 1.5 Flash",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "huggingface",
    emoji: "🤗",
    label: "HuggingFace",
    description: "Access thousands of open-source models via Inference API",
    envVar: "HF_TOKEN",
    freeTierNote: "Free tier: rate-limited, upgrade for more",
    getKeyUrl: "https://huggingface.co/settings/tokens",
  },
  {
    id: "mistral",
    emoji: "🌬️",
    label: "Mistral AI",
    description: "Mistral Small/Nemo/Large via La Plateforme",
    envVar: "MISTRAL_API_KEY",
    freeTierNote: "Free evaluation tier — rate-limited, no card required",
    getKeyUrl: "https://console.mistral.ai/api-keys",
  },
  {
    id: "cloudflare",
    emoji: "☁️",
    label: "Cloudflare Workers AI",
    description: "Edge-hosted open models (Llama, GPT-OSS) via Cloudflare's global network",
    envVar: "CLOUDFLARE_API_TOKEN",
    freeTierNote: "Free tier: 10,000 Neurons/day, resets daily at 00:00 UTC",
    getKeyUrl: "https://dash.cloudflare.com/profile/api-tokens",
    extraField: {
      envVar: "CLOUDFLARE_ACCOUNT_ID",
      label: "Account ID",
      placeholder: "Your Cloudflare account ID",
    },
  },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ["Ctrl", "K"], mac: ["⌘", "K"], action: "Open command palette" },
  { keys: ["Ctrl", "/"], mac: ["⌘", "/"], action: "Toggle AI assistant" },
  { keys: ["Ctrl", "N"], mac: ["⌘", "N"], action: "New project" },
  { keys: ["Ctrl", ","], mac: ["⌘", ","], action: "Settings" },
  { keys: ["Ctrl", "Shift", "P"], mac: ["⌘", "⇧", "P"], action: "AI Studio" },
  { keys: ["Ctrl", "Shift", "A"], mac: ["⌘", "⇧", "A"], action: "Open ANu assistant" },
  { keys: ["Ctrl", "S"], mac: ["⌘", "S"], action: "Save current file" },
  { keys: ["Ctrl", "Z"], mac: ["⌘", "Z"], action: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], mac: ["⌘", "⇧", "Z"], action: "Redo" },
  { keys: ["Ctrl", "F"], mac: ["⌘", "F"], action: "Find in page" },
];


// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: "none",
        background: checked
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : "var(--border, #e2e8f0)",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
        outline: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#ffffff",
          transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// SettingRow
// ---------------------------------------------------------------------------

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 0",
        borderBottom: "1px solid var(--border, #e2e8f0)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--foreground, #0f172a)",
            marginBottom: description ? 2 : 0,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: 12,
              color: "var(--muted, #64748b)",
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionCard
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--border, #e2e8f0)",
        borderRadius: 16,
        padding: "24px",
        marginBottom: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {title && (
        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: "var(--foreground, #0f172a)",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "var(--muted, #64748b)",
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast system
// ---------------------------------------------------------------------------

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 10,
            background:
              t.type === "success"
                ? "#052e16"
                : t.type === "error"
                ? "#450a0a"
                : "#0f172a",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            pointerEvents: "all",
            cursor: "pointer",
            animation: "slideUp 0.2s ease",
            maxWidth: 320,
          }}
          onClick={() => onRemove(t.id)}
        >
          <span>
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          {t.message}
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GeneralTab
// ---------------------------------------------------------------------------

function GeneralTab({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const [userName, setUserName] = useState("Nagaraj");
  const [userEmail, setUserEmail] = useState("anenterprises9396@gmail.com");
  const [autoSave, setAutoSave] = useState(true);
  const [telemetry, setTelemetry] = useState(false);

  const handleSave = () => {
    addToast("General settings saved", "success");
  };

  return (
    <>
      <SectionCard title="Workspace" description="Configure your workspace identity and preferences">
        <SettingRow label="Workspace Name" description="The name shown in the app title and exports">
          <input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            style={{
              width: 220,
              height: 36,
              padding: "0 12px",
              borderRadius: 8,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--background, #f8fafc)",
              color: "var(--foreground, #0f172a)",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </SettingRow>
        <SettingRow label="Auto-save" description="Automatically save changes as you work">
          <Toggle checked={autoSave} onChange={setAutoSave} label="Toggle auto-save" />
        </SettingRow>
        <SettingRow label="Telemetry" description="Send anonymous usage data to help improve the product">
          <Toggle checked={telemetry} onChange={setTelemetry} label="Toggle telemetry" />
        </SettingRow>
      </SectionCard>

      <SectionCard title="User Profile" description="Your personal information shown across the app">
        <SettingRow label="Display Name">
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              width: 220,
              height: 36,
              padding: "0 12px",
              borderRadius: 8,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--background, #f8fafc)",
              color: "var(--foreground, #0f172a)",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </SettingRow>
        <SettingRow label="Email Address">
          <input
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            type="email"
            style={{
              width: 220,
              height: 36,
              padding: "0 12px",
              borderRadius: 8,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--background, #f8fafc)",
              color: "var(--foreground, #0f172a)",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </SettingRow>
        <div style={{ paddingTop: 16 }}>
          <button
            onClick={handleSave}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
            }}
          >
            Save Changes
          </button>
        </div>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
// AIAgentsTab
// ---------------------------------------------------------------------------

function AIAgentsTab({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [multiAgent, setMultiAgent] = useState(true);
  const [defaultAgent, setDefaultAgent] = useState("anu");
  const [maxRetries, setMaxRetries] = useState(3);
  const [timeout, setTimeout] = useState(30);
  const [contextMemory, setContextMemory] = useState(true);
  const [temperature, setTemperature] = useState(0.7);

  return (
    <>
      <SectionCard title="Agent Behavior" description="Configure how AI agents operate in your workspace">
        <SettingRow label="Multi-agent Mode" description="Enable coordination between multiple AI agents on complex tasks">
          <Toggle checked={multiAgent} onChange={setMultiAgent} label="Toggle multi-agent mode" />
        </SettingRow>
        <SettingRow label="Default Agent" description="The primary AI agent used for new conversations">
          <select
            value={defaultAgent}
            onChange={(e) => setDefaultAgent(e.target.value)}
            style={{
              width: 180,
              height: 36,
              padding: "0 10px",
              borderRadius: 8,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--background, #f8fafc)",
              color: "var(--foreground, #0f172a)",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="anu">ANu (Local)</option>
            <option value="groq">Groq — Llama</option>
            <option value="cerebras">Cerebras</option>
            <option value="openrouter">OpenRouter</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </SettingRow>
        <SettingRow label="Context Memory" description="Remember conversation history across sessions">
          <Toggle checked={contextMemory} onChange={setContextMemory} label="Toggle context memory" />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Performance" description="Fine-tune agent response behavior">
        <SettingRow label="Max Retries" description="How many times to retry a failed agent request">
          <input
            type="number"
            min={0}
            max={10}
            value={maxRetries}
            onChange={(e) => setMaxRetries(Number(e.target.value))}
            style={{
              width: 80,
              height: 36,
              padding: "0 12px",
              borderRadius: 8,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--background, #f8fafc)",
              color: "var(--foreground, #0f172a)",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </SettingRow>
        <SettingRow label="Request Timeout (s)" description="Maximum seconds to wait for an agent response">
          <input
            type="number"
            min={5}
            max={120}
            value={timeout}
            onChange={(e) => setTimeout(Number(e.target.value))}
            style={{
              width: 80,
              height: 36,
              padding: "0 12px",
              borderRadius: 8,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--background, #f8fafc)",
              color: "var(--foreground, #0f172a)",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </SettingRow>
        <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground, #0f172a)" }}>
                Agent Temperature
              </div>
              <div style={{ fontSize: 12, color: "var(--muted, #64748b)", marginTop: 2 }}>
                Controls response creativity — lower is more focused, higher is more creative
              </div>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#6366f1",
                background: "#6366f115",
                padding: "4px 10px",
                borderRadius: 6,
                minWidth: 42,
                textAlign: "center",
              }}
            >
              {temperature.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: "var(--muted, #64748b)" }}>Focused (0.1)</span>
            <span style={{ fontSize: 11, color: "var(--muted, #64748b)" }}>Creative (1.0)</span>
          </div>
        </div>
        <div style={{ paddingTop: 16 }}>
          <button
            onClick={() => addToast("AI & Agent settings saved", "success")}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
            }}
          >
            Save Changes
          </button>
        </div>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
// ANuTab
// ---------------------------------------------------------------------------

type AnuStatus = "checking" | "running" | "stopped";

// Curated popular Ollama models for the in-app "browse and pull" library.
// Users can also pull any other Ollama tag via the "Pull by name" box below.
const OLLAMA_LIBRARY: { id: string; label: string; size: string; description: string }[] = [
  { id: "llama3.1:8b", label: "Llama 3.1 8B", size: "~4.7 GB", description: "Balanced quality & speed, general purpose" },
  { id: "qwen2.5-coder:7b", label: "Qwen 2.5 Coder 7B", size: "~4.7 GB", description: "Best for code generation" },
  { id: "deepseek-coder:6.7b", label: "DeepSeek Coder 6.7B", size: "~3.8 GB", description: "Excellent at code completion" },
  { id: "codellama:13b", label: "CodeLlama 13B", size: "~7.4 GB", description: "Code-specialized, strong performance" },
  { id: "mistral:7b", label: "Mistral 7B", size: "~4.1 GB", description: "Fast & capable general model" },
  { id: "llama3.1:70b", label: "Llama 3.1 70B", size: "~40 GB", description: "Best quality — needs ~40GB VRAM/RAM" },
  { id: "phi3:mini", label: "Phi-3 Mini", size: "~2.2 GB", description: "Small, fast, runs on modest hardware" },
];

interface PullState {
  status: "idle" | "pulling" | "done" | "error";
  percent: number;
  message: string;
}

function ANuTab({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [status, setStatus] = useState<AnuStatus>("checking");
  const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");
  const [defaultModel, setDefaultModel] = useState("llama3");
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [persona, setPersona] = useState("ANu is your in-house AI assistant — fast, private, and always available offline.");
  const [pullStates, setPullStates] = useState<Record<string, PullState>>({});
  const [customModelName, setCustomModelName] = useState("");

  useEffect(() => {
    fetch("/api/anu/status")
      .then((r) => setStatus(r.ok ? "running" : "stopped"))
      .catch(() => setStatus("stopped"));
  }, []);

  const loadModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const res = await fetch(`${ollamaHost}/api/tags`);
      if (res.ok) {
        const data = await res.json() as { models?: { name: string }[] };
        setModels((data.models ?? []).map((m) => m.name));
        addToast(`Found ${(data.models ?? []).length} local models`, "success");
      } else {
        addToast("Could not connect to Ollama", "error");
      }
    } catch {
      addToast("Ollama not reachable at this address", "error");
    } finally {
      setLoadingModels(false);
    }
  }, [ollamaHost, addToast]);

  const pullModel = useCallback(
    async (modelId: string) => {
      setPullStates((prev) => ({ ...prev, [modelId]: { status: "pulling", percent: 0, message: "Starting…" } }));
      try {
        const res = await fetch("/api/anu/pull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: modelId }),
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Pull request failed" }));
          setPullStates((prev) => ({
            ...prev,
            [modelId]: { status: "error", percent: 0, message: err.error ?? "Pull request failed" },
          }));
          addToast(`Failed to pull ${modelId}`, "error");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const evt = JSON.parse(trimmed) as {
                status?: string;
                completed?: number;
                total?: number;
                error?: string;
              };

              if (evt.error) {
                setPullStates((prev) => ({
                  ...prev,
                  [modelId]: { status: "error", percent: 0, message: evt.error ?? "Unknown error" },
                }));
                continue;
              }

              const percent =
                evt.total && evt.completed ? Math.round((evt.completed / evt.total) * 100) : 0;

              setPullStates((prev) => ({
                ...prev,
                [modelId]: {
                  status: evt.status === "success" ? "done" : "pulling",
                  percent: evt.status === "success" ? 100 : percent,
                  message: evt.status ?? "",
                },
              }));
            } catch {
              // ignore malformed NDJSON line
            }
          }
        }

        setPullStates((prev) => {
          const current = prev[modelId];
          if (current?.status === "error") return prev;
          return { ...prev, [modelId]: { status: "done", percent: 100, message: "Installed" } };
        });
        addToast(`${modelId} installed`, "success");
        void loadModels();
      } catch {
        setPullStates((prev) => ({
          ...prev,
          [modelId]: { status: "error", percent: 0, message: "Network error during pull" },
        }));
        addToast(`Failed to pull ${modelId}`, "error");
      }
    },
    [addToast, loadModels]
  );

  const statusColor = status === "running" ? "#22c55e" : status === "checking" ? "#f59e0b" : "#94a3b8";
  const statusLabel = status === "running" ? "Running" : status === "checking" ? "Checking..." : "Not Running";

  return (
    <>
      <SectionCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "8px 0",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6366f120, #8b5cf620)",
              border: "1.5px solid #6366f133",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            🧠
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--foreground, #0f172a)",
                }}
              >
                ANu — In-House AI
              </h3>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: status === "running" ? "#d1fae5" : "#f1f5f9",
                  color: status === "running" ? "#065f46" : "#475569",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: statusColor,
                    boxShadow: status === "running" ? `0 0 0 2px ${statusColor}44` : "none",
                    transition: "background 0.3s",
                  }}
                />
                {statusLabel}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--muted, #64748b)",
                lineHeight: 1.5,
              }}
            >
              Powered by Ollama — your private, local AI that never sends data to the cloud.
              Zero API cost, works offline.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Connection" description="Configure your local Ollama instance">
        <SettingRow label="Ollama Host URL" description="The address where Ollama is running">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={ollamaHost}
              onChange={(e) => setOllamaHost(e.target.value)}
              style={{
                width: 220,
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--background, #f8fafc)",
                color: "var(--foreground, #0f172a)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => void loadModels()}
              disabled={loadingModels}
              style={{
                padding: "0 14px",
                height: 36,
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--background, #f8fafc)",
                color: "var(--foreground, #0f172a)",
                fontSize: 12,
                fontWeight: 600,
                cursor: loadingModels ? "wait" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {loadingModels ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </SettingRow>
        <SettingRow label="Default Model" description="The Ollama model used by ANu by default">
          {models.length > 0 ? (
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              style={{
                width: 180,
                height: 36,
                padding: "0 10px",
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--background, #f8fafc)",
                color: "var(--foreground, #0f172a)",
                fontSize: 13,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <input
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder="llama3"
              style={{
                width: 180,
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--background, #f8fafc)",
                color: "var(--foreground, #0f172a)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          )}
        </SettingRow>
      </SectionCard>

      <SectionCard title="Model Library" description="Browse and pull models directly — no terminal needed">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {OLLAMA_LIBRARY.map((m) => {
            const installed = models.includes(m.id);
            const pull = pullStates[m.id] ?? { status: "idle" as const, percent: 0, message: "" };
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border, #e2e8f0)",
                  background: "var(--background, #f8fafc)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground, #0f172a)" }}>
                      {m.label}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted, #94a3b8)" }}>{m.size}</span>
                    {installed && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 8px",
                          borderRadius: 999,
                          background: "#d1fae5",
                          color: "#065f46",
                        }}
                      >
                        Installed
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted, #64748b)", marginTop: 2 }}>
                    {m.description}
                  </div>
                  {pull.status === "pulling" && (
                    <div style={{ marginTop: 6 }}>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 999,
                          background: "var(--border, #e2e8f0)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pull.percent}%`,
                            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                            transition: "width 0.2s",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted, #94a3b8)", marginTop: 3 }}>
                        {pull.message} {pull.percent > 0 ? `(${pull.percent}%)` : ""}
                      </div>
                    </div>
                  )}
                  {pull.status === "error" && (
                    <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{pull.message}</div>
                  )}
                </div>
                <button
                  onClick={() => void pullModel(m.id)}
                  disabled={pull.status === "pulling" || installed}
                  style={{
                    padding: "0 16px",
                    height: 32,
                    borderRadius: 8,
                    border: "none",
                    background:
                      installed || pull.status === "pulling"
                        ? "var(--border, #e2e8f0)"
                        : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: installed || pull.status === "pulling" ? "var(--muted, #64748b)" : "#ffffff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: installed || pull.status === "pulling" ? "default" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {installed ? "Installed" : pull.status === "pulling" ? "Pulling…" : "Pull"}
                </button>
              </div>
            );
          })}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              value={customModelName}
              onChange={(e) => setCustomModelName(e.target.value)}
              placeholder="Pull any other model by name, e.g. gemma2:9b"
              style={{
                flex: 1,
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--background, #f8fafc)",
                color: "var(--foreground, #0f172a)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => {
                if (customModelName.trim()) void pullModel(customModelName.trim());
              }}
              disabled={!customModelName.trim()}
              style={{
                padding: "0 16px",
                height: 36,
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--background, #f8fafc)",
                color: "var(--foreground, #0f172a)",
                fontSize: 12,
                fontWeight: 600,
                cursor: customModelName.trim() ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              Pull
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="ANu Persona" description="Customize how ANu introduces itself and its personality">
        <textarea
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            border: "1.5px solid var(--border, #e2e8f0)",
            background: "var(--background, #f8fafc)",
            color: "var(--foreground, #0f172a)",
            fontSize: 13,
            lineHeight: 1.6,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => addToast("ANu settings saved", "success")}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
            }}
          >
            Save ANu Settings
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Quick Setup">
        <div
          style={{
            padding: "16px",
            borderRadius: 12,
            background: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ color: "#94a3b8", marginBottom: 8 }}># Install Ollama</div>
          <div>
            <span style={{ color: "#86efac" }}>curl</span>
            <span style={{ color: "#fbbf24" }}> -fsSL https://ollama.ai/install.sh | sh</span>
          </div>
          <div style={{ marginTop: 8, color: "#94a3b8" }}># Pull recommended model</div>
          <div>
            <span style={{ color: "#86efac" }}>ollama</span>
            <span style={{ color: "#fbbf24" }}> pull llama3</span>
          </div>
          <div style={{ marginTop: 8, color: "#94a3b8" }}># Serve (starts automatically on install)</div>
          <div>
            <span style={{ color: "#86efac" }}>ollama</span>
            <span style={{ color: "#fbbf24" }}> serve</span>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
// ProvidersTab
// ---------------------------------------------------------------------------

function ProvidersTab({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [providerStates, setProviderStates] = useState<Record<string, ProviderState>>(() => {
    const initial: Record<string, ProviderState> = {};
    for (const p of PROVIDERS) {
      initial[p.id] = {
        keyValue: "",
        extraValue: "",
        savedInApp: false,
        fromEnv: false,
        saving: false,
        testing: false,
        testResult: null,
        saveSuccess: false,
      };
    }
    return initial;
  });

  const [keyStoragePersistent, setKeyStoragePersistent] = useState(true);

  useEffect(() => {
    // Matches the actual /api/config GET response shape:
    // { providers: { <providerId>: { configured, source: "env"|"config"|"none" } }, ollama: {...}, persistent }
    // Note: the API never returns the raw key value (by design, for
    // security) — only whether one is configured and where it came from.
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            providers: Record<string, { configured: boolean; source: "env" | "config" | "none" }>;
            persistent?: boolean;
          } | null
        ) => {
          if (!data) return;
          if (typeof data.persistent === "boolean") setKeyStoragePersistent(data.persistent);
          setProviderStates((prev) => {
            const next = { ...prev };
            for (const p of PROVIDERS) {
              const entry = data.providers?.[p.id];
              if (entry) {
                next[p.id] = {
                  ...next[p.id],
                  keyValue: entry.configured ? "••••••••" : "",
                  savedInApp: entry.configured && entry.source === "config",
                  fromEnv: entry.configured && entry.source === "env",
                };
              }
            }
            return next;
          });
        }
      )
      .catch(() => {});
  }, []);

  const updateState = useCallback(
    (id: string, patch: Partial<ProviderState>) => {
      setProviderStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...patch },
      }));
    },
    []
  );

  const handleSave = useCallback(
    async (provider: ProviderConfig) => {
      const state = providerStates[provider.id];
      if (!state.keyValue || state.keyValue === "••••••••") {
        addToast("Enter a key value first", "error");
        return;
      }
      if (provider.extraField && !state.extraValue) {
        addToast(`Enter ${provider.extraField.label} as well`, "error");
        return;
      }
      updateState(provider.id, { saving: true, saveSuccess: false });
      try {
        const res = await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: provider.envVar, value: state.keyValue }),
        });
        let extraOk = true;
        if (res.ok && provider.extraField) {
          const extraRes = await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: provider.extraField.envVar, value: state.extraValue }),
          });
          extraOk = extraRes.ok;
        }
        if (res.ok && extraOk) {
          updateState(provider.id, {
            saving: false,
            saveSuccess: true,
            savedInApp: true,
            fromEnv: false,
            keyValue: "••••••••",
          });
          addToast(`${provider.label} key saved`, "success");
          setTimeout(() => updateState(provider.id, { saveSuccess: false }), 3000);
        } else {
          updateState(provider.id, { saving: false });
          addToast(`Failed to save ${provider.label} key`, "error");
        }
      } catch {
        updateState(provider.id, { saving: false });
        addToast("Network error — could not save key", "error");
      }
    },
    [providerStates, updateState, addToast]
  );

  const handleClear = useCallback(
    async (provider: ProviderConfig) => {
      try {
        const res = await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: provider.envVar, value: "" }),
        });
        if (provider.extraField) {
          await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: provider.extraField.envVar, value: "" }),
          });
        }
        if (res.ok) {
          updateState(provider.id, {
            keyValue: "",
            extraValue: "",
            savedInApp: false,
            saveSuccess: false,
          });
          addToast(`${provider.label} key cleared`, "info");
        }
      } catch {
        addToast("Could not clear key", "error");
      }
    },
    [updateState, addToast]
  );

  const handleTest = useCallback(
    async (provider: ProviderConfig) => {
      updateState(provider.id, { testing: true, testResult: null });
      try {
        // provider.id ("anu-ollama") doesn't match the backend provider name
        // ("anu") that ProviderManager expects — map it so the test actually
        // forces the intended provider instead of silently falling through
        // to the default fallback chain.
        const backendProviderName = provider.id === "anu-ollama" ? "anu" : provider.id;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "ping" }],
            provider: backendProviderName,
          }),
        });

        // /api/chat always responds 200 immediately (it's a streaming SSE
        // response) — success/failure is reported as events *inside* the
        // stream, not via the HTTP status. Read the stream and look for an
        // "error" event to know whether the provider call actually worked.
        let succeeded = res.ok;
        let sawEvent = false;
        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n\n");
              buffer = lines.pop() ?? "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                try {
                  const evt = JSON.parse(trimmed.slice(5).trim()) as { type?: string };
                  if (evt.type === "error") {
                    succeeded = false;
                    sawEvent = true;
                  } else if (evt.type === "meta" || evt.type === "done") {
                    sawEvent = true;
                  }
                } catch {
                  // ignore malformed SSE chunk
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
          // No events at all (e.g. empty stream) means we can't confirm success.
          if (!sawEvent) succeeded = false;
        } else {
          succeeded = false;
        }

        updateState(provider.id, {
          testing: false,
          testResult: succeeded ? "success" : "error",
        });
        addToast(
          succeeded
            ? `${provider.label} connection successful`
            : `${provider.label} connection failed`,
          succeeded ? "success" : "error"
        );
      } catch {
        updateState(provider.id, { testing: false, testResult: "error" });
        addToast(`${provider.label} is not reachable`, "error");
      }
    },
    [updateState, addToast]
  );

  return (
    <>
      {/* Banner */}
      <div
        style={{
          padding: "14px 18px",
          borderRadius: 12,
          background: "#fffbeb",
          border: "1.5px solid #fbbf2455",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>🔐</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 3 }}>
            Secure Key Storage
          </div>
          <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>
            Keys saved here are stored in{" "}
            <code
              style={{
                background: "#fef3c7",
                padding: "1px 5px",
                borderRadius: 4,
                fontFamily: "monospace",
              }}
            >
              config/runtime.json
            </code>{" "}
            which is gitignored. For production deployments, add them as{" "}
            <strong>Vercel Environment Variables</strong> — they take precedence automatically.
          </div>
          {!keyStoragePersistent && (
            <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6, marginTop: 6, fontWeight: 600 }}>
              ⚠️ This deployment&apos;s filesystem is read-only — keys saved here are written to a
              temporary location and may be lost on the next cold start or redeploy. Set them as
              real Vercel Environment Variables instead for anything you want to keep.
            </div>
          )}
        </div>
      </div>

      {/* Provider cards */}
      {PROVIDERS.map((provider) => {
        const state = providerStates[provider.id];
        const isConfigured = state.savedInApp || state.fromEnv;

        return (
          <div
            key={provider.id}
            style={{
              background: "var(--surface, #ffffff)",
              border: `1.5px solid ${isConfigured ? "#22c55e33" : "var(--border, #e2e8f0)"}`,
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: 14,
              boxShadow: isConfigured
                ? "0 2px 8px rgba(34,197,94,0.08)"
                : "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
              {/* Left: info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  flex: "1 1 280px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "var(--background, #f8fafc)",
                    border: "1.5px solid var(--border, #e2e8f0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {provider.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--foreground, #0f172a)",
                      }}
                    >
                      {provider.label}
                    </span>

                    {/* Source badge */}
                    {state.fromEnv && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "#d1fae5",
                          color: "#065f46",
                          border: "1px solid #6ee7b7",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        🔒 Environment Variable
                      </span>
                    )}
                    {state.savedInApp && !state.fromEnv && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "#dbeafe",
                          color: "#1e40af",
                          border: "1px solid #93c5fd",
                        }}
                      >
                        Saved in app
                      </span>
                    )}
                    {!isConfigured && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "#f1f5f9",
                          color: "#64748b",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        Not configured
                      </span>
                    )}

                    {/* Save success badge */}
                    {state.saveSuccess && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "#d1fae5",
                          color: "#065f46",
                          animation: "fadeIn 0.2s ease",
                        }}
                      >
                        ✓ Saved
                      </span>
                    )}
                    {state.testResult === "success" && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "#d1fae5",
                          color: "#065f46",
                        }}
                      >
                        ✓ Connected
                      </span>
                    )}
                    {state.testResult === "error" && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "#fee2e2",
                          color: "#991b1b",
                        }}
                      >
                        ✕ Failed
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted, #64748b)",
                      lineHeight: 1.5,
                      marginBottom: 4,
                    }}
                  >
                    {provider.description}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#22c55e",
                      fontWeight: 600,
                    }}
                  >
                    {provider.freeTierNote}
                  </div>
                </div>
              </div>

              {/* Right: key input + actions */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: "1 1 240px",
                  minWidth: 220,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="password"
                    placeholder={
                      state.fromEnv
                        ? "Set via environment variable"
                        : `Enter ${provider.envVar}...`
                    }
                    value={state.keyValue}
                    disabled={state.fromEnv}
                    onChange={(e) => updateState(provider.id, { keyValue: e.target.value })}
                    onFocus={(e) => {
                      if (e.target.value === "••••••••") {
                        updateState(provider.id, { keyValue: "" });
                      }
                    }}
                    style={{
                      flex: 1,
                      height: 36,
                      padding: "0 12px",
                      borderRadius: 8,
                      border: "1.5px solid var(--border, #e2e8f0)",
                      background: state.fromEnv
                        ? "var(--background, #f8fafc)"
                        : "var(--surface, #ffffff)",
                      color: "var(--foreground, #0f172a)",
                      fontSize: 13,
                      outline: "none",
                      opacity: state.fromEnv ? 0.6 : 1,
                      cursor: state.fromEnv ? "not-allowed" : "text",
                      minWidth: 0,
                    }}
                  />
                  <button
                    onClick={() => void handleSave(provider)}
                    disabled={state.saving || state.fromEnv}
                    style={{
                      padding: "0 14px",
                      height: 36,
                      borderRadius: 8,
                      border: "none",
                      background:
                        state.saving || state.fromEnv
                          ? "#e2e8f0"
                          : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: state.saving || state.fromEnv ? "#94a3b8" : "#ffffff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor:
                        state.saving || state.fromEnv ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {state.saving ? "Saving..." : "Save"}
                  </button>
                </div>

                {provider.extraField && (
                  <input
                    type="text"
                    placeholder={provider.extraField.placeholder}
                    value={state.extraValue}
                    disabled={state.fromEnv}
                    onChange={(e) => updateState(provider.id, { extraValue: e.target.value })}
                    style={{
                      height: 36,
                      padding: "0 12px",
                      borderRadius: 8,
                      border: "1.5px solid var(--border, #e2e8f0)",
                      background: state.fromEnv
                        ? "var(--background, #f8fafc)"
                        : "var(--surface, #ffffff)",
                      color: "var(--foreground, #0f172a)",
                      fontSize: 13,
                      outline: "none",
                      opacity: state.fromEnv ? 0.6 : 1,
                      cursor: state.fromEnv ? "not-allowed" : "text",
                    }}
                  />
                )}

                {/* Action row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => void handleTest(provider)}
                    disabled={state.testing || !isConfigured}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 7,
                      border: "1.5px solid var(--border, #e2e8f0)",
                      background: "transparent",
                      color:
                        state.testing || !isConfigured
                          ? "var(--muted, #94a3b8)"
                          : "var(--foreground, #0f172a)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor:
                        state.testing || !isConfigured ? "not-allowed" : "pointer",
                    }}
                  >
                    {state.testing ? "Testing..." : "Test Connection"}
                  </button>

                  {(state.savedInApp) && (
                    <button
                      onClick={() => void handleClear(provider)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 7,
                        border: "1.5px solid #fca5a5",
                        background: "transparent",
                        color: "#ef4444",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Clear Key
                    </button>
                  )}

                  <a
                    href={provider.getKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "5px 12px",
                      borderRadius: 7,
                      border: "1.5px solid var(--border, #e2e8f0)",
                      background: "transparent",
                      color: "#6366f1",
                      fontSize: 11,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Get Free Key ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
// AppearanceTab
// ---------------------------------------------------------------------------

function AppearanceTab({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [fontSize, setFontSize] = useState<"small" | "normal" | "large">("normal");
  const [sidebar, setSidebar] = useState<"wide" | "narrow">("wide");
  const [animations, setAnimations] = useState(true);
  const [compact, setCompact] = useState(false);

  const ACCENT_COLORS = [
    { label: "Indigo", value: "#6366f1" },
    { label: "Purple", value: "#8b5cf6" },
    { label: "Green", value: "#22c55e" },
    { label: "Orange", value: "#f97316" },
    { label: "Pink", value: "#ec4899" },
    { label: "Red", value: "#ef4444" },
  ];

  const applyTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else if (t === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    addToast(`Theme set to ${t}`, "info");
  };

  return (
    <>
      <SectionCard title="Theme" description="Choose your preferred color scheme">
        <div style={{ display: "flex", gap: 8, padding: "8px 0" }}>
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => applyTheme(t)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: theme === t ? "2px solid #6366f1" : "1.5px solid var(--border, #e2e8f0)",
                background: theme === t ? "#6366f115" : "var(--surface, #ffffff)",
                color: theme === t ? "#6366f1" : "var(--muted, #64748b)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {t === "light" ? "☀️" : t === "dark" ? "🌙" : "💻"} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Accent Color" description="The primary highlight color used throughout the UI">
        <div style={{ display: "flex", gap: 12, padding: "8px 0", flexWrap: "wrap" }}>
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => {
                setAccentColor(c.value);
                addToast(`Accent color set to ${c.label}`, "info");
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: c.value,
                border: accentColor === c.value
                  ? `3px solid ${c.value}`
                  : "3px solid transparent",
                outline: accentColor === c.value ? `2px solid ${c.value}55` : "none",
                cursor: "pointer",
                transition: "transform 0.15s",
                transform: accentColor === c.value ? "scale(1.15)" : "scale(1)",
                boxShadow: accentColor === c.value ? `0 0 0 2px white, 0 0 0 4px ${c.value}` : "none",
              }}
              aria-label={`Accent color: ${c.label}`}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Typography & Layout" description="Adjust size and density preferences">
        <SettingRow label="Font Size" description="Controls the base text size across the application">
          <div style={{ display: "flex", gap: 6 }}>
            {(["small", "normal", "large"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  border: fontSize === s ? "1.5px solid #6366f1" : "1.5px solid var(--border, #e2e8f0)",
                  background: fontSize === s ? "#6366f115" : "transparent",
                  color: fontSize === s ? "#6366f1" : "var(--muted, #64748b)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Sidebar Width" description="Choose between a wider or more compact sidebar">
          <div style={{ display: "flex", gap: 6 }}>
            {(["wide", "narrow"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSidebar(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  border: sidebar === s ? "1.5px solid #6366f1" : "1.5px solid var(--border, #e2e8f0)",
                  background: sidebar === s ? "#6366f115" : "transparent",
                  color: sidebar === s ? "#6366f1" : "var(--muted, #64748b)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Animations" description="Enable smooth transitions and motion effects">
          <Toggle checked={animations} onChange={setAnimations} label="Toggle animations" />
        </SettingRow>
        <SettingRow label="Compact Mode" description="Reduce padding and spacing for higher information density">
          <Toggle checked={compact} onChange={setCompact} label="Toggle compact mode" />
        </SettingRow>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
// NotificationsTab
// ---------------------------------------------------------------------------

function NotificationsTab({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [browserNotifs, setBrowserNotifs] = useState(false);
  const [agentAlerts, setAgentAlerts] = useState(true);
  const [errorAlerts, setErrorAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setBrowserNotifs(true);
        addToast("Browser notifications enabled", "success");
      } else {
        addToast("Browser notification permission denied", "error");
      }
    }
  };

  return (
    <SectionCard title="Notification Preferences" description="Control when and how you receive updates">
      <SettingRow label="Email Notifications" description="Receive important alerts and summaries via email">
        <Toggle checked={emailNotifs} onChange={setEmailNotifs} label="Toggle email notifications" />
      </SettingRow>
      <SettingRow
        label="Browser Notifications"
        description="Show desktop push notifications when the app is in background"
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Toggle
            checked={browserNotifs}
            onChange={(v) => {
              if (v) {
                void requestBrowserPermission();
              } else {
                setBrowserNotifs(false);
              }
            }}
            label="Toggle browser notifications"
          />
        </div>
      </SettingRow>
      <SettingRow label="Agent Completion Alerts" description="Get notified when an AI agent finishes a long task">
        <Toggle checked={agentAlerts} onChange={setAgentAlerts} label="Toggle agent alerts" />
      </SettingRow>
      <SettingRow label="Error Alerts" description="Immediate notifications when something goes wrong">
        <Toggle checked={errorAlerts} onChange={setErrorAlerts} label="Toggle error alerts" />
      </SettingRow>
      <SettingRow label="Daily Digest" description="A morning summary of yesterday's agent activity and project updates">
        <Toggle checked={dailyDigest} onChange={setDailyDigest} label="Toggle daily digest" />
      </SettingRow>
      <div style={{ paddingTop: 16 }}>
        <button
          onClick={() => addToast("Notification preferences saved", "success")}
          style={{
            padding: "9px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
          }}
        >
          Save Preferences
        </button>
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// KeyboardTab
// ---------------------------------------------------------------------------

function KeyboardTab() {
  const isMac =
    typeof navigator !== "undefined"
      ? /mac/i.test(navigator.platform)
      : false;

  return (
    <SectionCard
      title="Keyboard Shortcuts"
      description="Master these shortcuts to work faster across the app"
    >
      <div
        style={{
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            padding: "10px 16px",
            background: "var(--background, #f8fafc)",
            borderBottom: "1px solid var(--border, #e2e8f0)",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Action
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Shortcut
          </span>
        </div>

        {KEYBOARD_SHORTCUTS.map((s, i) => {
          const keys = isMac ? s.mac : s.keys;
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                padding: "12px 16px",
                borderBottom:
                  i < KEYBOARD_SHORTCUTS.length - 1
                    ? "1px solid var(--border, #e2e8f0)"
                    : "none",
                alignItems: "center",
                background: i % 2 === 0 ? "transparent" : "var(--background, #f8fafc)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "var(--foreground, #0f172a)",
                  fontWeight: 500,
                }}
              >
                {s.action}
              </span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {keys.map((k, ki) => (
                  <span key={ki}>
                    <kbd
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1.5px solid var(--border, #e2e8f0)",
                        background: "var(--surface, #ffffff)",
                        color: "var(--foreground, #0f172a)",
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "inherit",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        minWidth: 22,
                      }}
                    >
                      {k}
                    </kbd>
                    {ki < keys.length - 1 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--muted, #94a3b8)",
                          marginLeft: 4,
                        }}
                      >
                        +
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: 10,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          fontSize: 12,
          color: "#1e40af",
          lineHeight: 1.5,
        }}
      >
        <strong>Tip:</strong> Keyboard shortcuts can be customized in a future update. For now, these are the system defaults.
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// DeploymentTab
// ---------------------------------------------------------------------------

function DeploymentTab({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [vercelToken, setVercelToken] = useState("");
  const [vercelTokenMasked, setVercelTokenMasked] = useState(false);
  const [region, setRegion] = useState("iad1");
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [environment, setEnvironment] = useState<"production" | "preview" | "development">("production");
  const [saving, setSaving] = useState(false);

  const handleSaveVercel = async () => {
    if (!vercelToken || vercelToken === "••••••••••••••••") {
      addToast("Enter a Vercel token first", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "VERCEL_TOKEN", value: vercelToken }),
      });
      if (res.ok) {
        setVercelToken("••••••••••••••••");
        setVercelTokenMasked(true);
        addToast("Vercel token saved", "success");
      } else {
        addToast("Failed to save Vercel token", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const REGIONS = [
    { value: "iad1", label: "Washington D.C. (iad1)" },
    { value: "sfo1", label: "San Francisco (sfo1)" },
    { value: "lhr1", label: "London (lhr1)" },
    { value: "fra1", label: "Frankfurt (fra1)" },
    { value: "sin1", label: "Singapore (sin1)" },
    { value: "hnd1", label: "Tokyo (hnd1)" },
    { value: "syd1", label: "Sydney (syd1)" },
  ];

  return (
    <>
      <SectionCard title="Vercel Integration" description="Connect to Vercel for one-click deployments">
        <SettingRow label="Vercel Token" description="Your Vercel personal access token for deployment">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              placeholder="Enter Vercel token..."
              value={vercelToken}
              onFocus={() => {
                if (vercelTokenMasked) setVercelToken("");
              }}
              onChange={(e) => setVercelToken(e.target.value)}
              style={{
                width: 200,
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--background, #f8fafc)",
                color: "var(--foreground, #0f172a)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => void handleSaveVercel()}
              disabled={saving}
              style={{
                padding: "0 14px",
                height: 36,
                borderRadius: 8,
                border: "none",
                background: saving ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: saving ? "#94a3b8" : "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {saving ? "Saving..." : "Save Token"}
            </button>
          </div>
        </SettingRow>

        <SettingRow label="Default Region" description="The Vercel edge region for new deployments">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{
              width: 220,
              height: 36,
              padding: "0 10px",
              borderRadius: 8,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--background, #f8fafc)",
              color: "var(--foreground, #0f172a)",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </SettingRow>

        <SettingRow label="Auto-deploy on Commit" description="Automatically deploy when you push to the main branch">
          <Toggle checked={autoDeploy} onChange={setAutoDeploy} label="Toggle auto-deploy" />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Deployment Environment" description="The target environment for deployments from this workspace">
        <div style={{ display: "flex", gap: 8, padding: "8px 0" }}>
          {(["production", "preview", "development"] as const).map((env) => (
            <button
              key={env}
              onClick={() => setEnvironment(env)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: environment === env ? "1.5px solid #6366f1" : "1.5px solid var(--border, #e2e8f0)",
                background: environment === env ? "#6366f115" : "transparent",
                color: environment === env ? "#6366f1" : "var(--muted, #64748b)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.15s",
              }}
            >
              {env === "production" ? "🟢" : env === "preview" ? "🟡" : "🔵"}{" "}
              {env.charAt(0).toUpperCase() + env.slice(1)}
            </button>
          ))}
        </div>
      </SectionCard>

      <div
        style={{
          padding: "14px 18px",
          borderRadius: 12,
          background: "#f0fdf4",
          border: "1.5px solid #86efac",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.6 }}>
          <strong>Pro tip:</strong> Add your Vercel token to your{" "}
          <code
            style={{
              background: "#dcfce7",
              padding: "1px 5px",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            .env.local
          </code>{" "}
          file as <code style={{ background: "#dcfce7", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>VERCEL_TOKEN</code> for
          local deployments, and add it to Vercel Environment Variables for production CI/CD.
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PlanTab
// ---------------------------------------------------------------------------

interface PlanLimits {
  id: "free" | "pro" | "team";
  label: string;
  maxProjects: number | null;
  providerAccess: "anu-only" | "full-chain";
  verifyLoopMaxIterations: number;
  autoApproveAllowed: boolean;
  support: string;
}

interface LicenseStatus {
  plan: "free" | "pro" | "team";
  licenseKeyMasked: string | null;
  lastValidatedAt: number | null;
  graceActive: boolean;
  graceExpiresAt: number | null;
}

function PlanTab({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [status, setStatus] = useState<LicenseStatus | null>(null);
  const [plan, setPlan] = useState<PlanLimits | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    fetch("/api/licensing")
      .then((r) => r.json())
      .then((data: { status: LicenseStatus; plan: PlanLimits }) => {
        setStatus(data.status);
        setPlan(data.plan);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      addToast("Enter a license key first", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/licensing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("License activated — you're on Pro.", "success");
        setLicenseKey("");
        setStatus(data.status);
        setPlan(data.plan);
      } else {
        addToast(data.error ?? "Activation failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeactivate = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/licensing", { method: "DELETE" });
      const data = await res.json();
      addToast("License removed — back to Free.", "info");
      setStatus(data.status);
      setPlan(data.plan);
    } catch {
      addToast("Network error", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SectionCard title="Current plan" description="AN Dev Studio is desktop-first: no hosted account, just a license key.">
        <SettingRow label="Plan" description={plan?.support}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: status?.plan === "pro" ? "#6366f115" : "#94a3b815",
              color: status?.plan === "pro" ? "#6366f1" : "#64748b",
            }}
          >
            {plan?.label ?? "…"}
          </span>
        </SettingRow>
        <SettingRow label="Projects" description="Maximum projects this plan allows">
          <span style={{ fontSize: 13, color: "var(--muted, #64748b)" }}>
            {plan?.maxProjects === null ? "Unlimited" : plan?.maxProjects}
          </span>
        </SettingRow>
        <SettingRow label="AI providers" description="Which providers the fallback chain can use">
          <span style={{ fontSize: 13, color: "var(--muted, #64748b)" }}>
            {plan?.providerAccess === "full-chain" ? "Full fallback chain" : "Local ANu only"}
          </span>
        </SettingRow>
        <SettingRow label="Verify loop" description="Max iterations of the build-verify-fix loop">
          <span style={{ fontSize: 13, color: "var(--muted, #64748b)" }}>
            {plan?.verifyLoopMaxIterations} iteration(s){plan?.autoApproveAllowed ? ", auto-approve allowed" : ""}
          </span>
        </SettingRow>
        {status?.graceActive && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#f59e0b" }}>
            Offline grace period active — couldn&apos;t reach the license server recently, but your Pro plan stays
            active until {status.graceExpiresAt ? new Date(status.graceExpiresAt).toLocaleDateString() : "soon"}.
          </div>
        )}
      </SectionCard>

      <SectionCard title="License key" description="Paste the key from your purchase confirmation email to unlock Pro.">
        <SettingRow label="License key" description={status?.licenseKeyMasked ? `Active: ${status.licenseKeyMasked}` : "No key activated"}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              style={{
                width: 220,
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--background, #f8fafc)",
                color: "var(--foreground, #0f172a)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => void handleActivate()}
              disabled={busy}
              style={{
                padding: "0 14px",
                height: 36,
                borderRadius: 8,
                border: "none",
                background: busy ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: busy ? "#94a3b8" : "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                cursor: busy ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {busy ? "…" : "Activate"}
            </button>
            {status?.licenseKeyMasked && (
              <button
                onClick={() => void handleDeactivate()}
                disabled={busy}
                style={{
                  padding: "0 14px",
                  height: 36,
                  borderRadius: 8,
                  border: "1.5px solid var(--border, #e2e8f0)",
                  background: "transparent",
                  color: "var(--foreground, #0f172a)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: busy ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Remove
              </button>
            )}
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Upgrade to Pro" description="Unlimited projects, the full AI provider fallback chain, and the full verify-and-fix loop with auto-approve.">
        <a
          href="https://andevstudio.lemonsqueezy.com/checkout/buy/1b82baf9-6d26-4e05-9f9f-23258d7c597e"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Upgrade to Pro →
        </a>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
// AboutTab
// ---------------------------------------------------------------------------

function AboutTab() {
  return (
    <>
      <SectionCard>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "24px 0",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            ⚡
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--foreground, #0f172a)",
              }}
            >
              AN Dev Studio
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--muted, #64748b)" }}>
              The AI-native development workspace
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: "#6366f115",
                color: "#6366f1",
                fontSize: 12,
                fontWeight: 700,
                border: "1px solid #6366f133",
              }}
            >
              v0.1.0-alpha
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: "#22c55e15",
                color: "#16a34a",
                fontSize: 12,
                fontWeight: 700,
                border: "1px solid #22c55e33",
              }}
            >
              Next.js 15
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: "#3b82f615",
                color: "#1d4ed8",
                fontSize: 12,
                fontWeight: 700,
                border: "1px solid #3b82f633",
              }}
            >
              React 19
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="System Info">
        {[
          { label: "Version", value: "1.0.0" },
          { label: "Build", value: new Date().toISOString().split("T")[0] },
          { label: "Framework", value: "Next.js 16 (App Router)" },
          { label: "Runtime", value: "Node.js" },
          { label: "AI Engine", value: "ANu + Multi-provider fallback" },
          { label: "License", value: "Proprietary — AN Group" },
        ].map(({ label, value }) => (
          <SettingRow key={label} label={label}>
            <span
              style={{
                fontSize: 13,
                color: "var(--muted, #64748b)",
                fontFamily: "monospace",
                background: "var(--background, #f8fafc)",
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid var(--border, #e2e8f0)",
              }}
            >
              {value}
            </span>
          </SettingRow>
        ))}
      </SectionCard>

      <SectionCard title="Built By">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "8px 0",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            NA
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                marginBottom: 2,
              }}
            >
              Nagaraj
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--muted, #64748b)",
              }}
            >
              anenterprises9396@gmail.com · AN Enterprises
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

// ---------------------------------------------------------------------------
// SettingsPage
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = useRef(0);

  // Handle hash navigation (e.g., /settings#anu)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabId;
    if (hash && TABS.some((t) => t.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = String(++toastCounter.current);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab addToast={addToast} />;
      case "ai-agents":
        return <AIAgentsTab addToast={addToast} />;
      case "anu":
        return <ANuTab addToast={addToast} />;
      case "providers":
        return <ProvidersTab addToast={addToast} />;
      case "plan":
        return <PlanTab addToast={addToast} />;
      case "appearance":
        return <AppearanceTab addToast={addToast} />;
      case "notifications":
        return <NotificationsTab addToast={addToast} />;
      case "keyboard":
        return <KeyboardTab />;
      case "deployment":
        return <DeploymentTab addToast={addToast} />;
      case "about":
        return <AboutTab />;
      default:
        return null;
    }
  };

  const activeTabData = TABS.find((t) => t.id === activeTab);

  return (
    <AppShell title="Settings">
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--foreground, #0f172a)",
            margin: "0 0 4px",
          }}
        >
          Settings
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--muted, #64748b)" }}>
          Configure your workspace, AI providers, appearance and more
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Sidebar nav */}
        <nav
          aria-label="Settings sections"
          style={{
            background: "var(--surface, #ffffff)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: 16,
            padding: "8px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            position: "sticky",
            top: 72,
          }}
        >
          {TABS.map(({ id, label, icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  window.history.replaceState(null, "", `/settings#${id}`);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: isActive
                    ? "linear-gradient(135deg, #6366f115, #8b5cf610)"
                    : "transparent",
                  color: isActive ? "#6366f1" : "var(--muted, #64748b)",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--background, #f8fafc)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        <div style={{ minWidth: 0 }}>
          {/* Tab heading */}
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 19,
                fontWeight: 800,
                color: "var(--foreground, #0f172a)",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{activeTabData?.icon}</span>
              {activeTabData?.label}
            </h2>
          </div>

          {renderTab()}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppShell>
  );
}
