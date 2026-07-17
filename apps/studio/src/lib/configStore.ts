import * as fs from "fs";
import * as path from "path";

// On Vercel (and most serverless hosts) the deployment bundle is read-only —
// only /tmp is writable, and it does not persist across cold starts or
// across separate function instances. Detect that case and fall back to
// /tmp so writes don't throw; on a normal server/local dev, config/runtime.json
// persists normally across restarts.
const IS_SERVERLESS = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

const CONFIG_PATH = IS_SERVERLESS
  ? path.join("/tmp", "an-dev-studio-runtime.json")
  : path.join(process.cwd(), "config", "runtime.json");

export function isRuntimeConfigPersistent(): boolean {
  return !IS_SERVERLESS;
}

function readConfigFile(): { [key: string]: string } {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as { [key: string]: string };
    }
    return {};
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return {};
    }
    throw err;
  }
}

export function getRuntimeConfig(): { [key: string]: string } {
  const fileConfig = readConfigFile();
  const merged: { [key: string]: string } = { ...fileConfig };

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      merged[key] = value;
    }
  }

  return merged;
}

export function getProviderKey(providerName: string): string | undefined {
  const envKey = PROVIDER_ENV_VAR[providerName.toLowerCase()];
  if (!envKey) {
    return undefined;
  }
  const config = getRuntimeConfig();
  return config[envKey];
}

export function getOllamaConfig(): {
  enabled: boolean;
  host: string;
  defaultModel: string;
} {
  const config = getRuntimeConfig();

  const enabled =
    config["OLLAMA_ENABLED"] === "true" || config["OLLAMA_ENABLED"] === "1";

  const host = config["OLLAMA_HOST"] ?? "http://localhost:11434";

  const defaultModel = config["OLLAMA_DEFAULT_MODEL"] ?? "llama3";

  return { enabled, host, defaultModel };
}

// ── Shared read/write helpers for the /api/config route ────────────────────
// Centralized here (rather than duplicated in the route handler) so the
// route and the providers always agree on where the file lives.

export const ALLOWED_RUNTIME_KEYS = new Set([
  "GROQ_API_KEY",
  "CEREBRAS_API_KEY",
  "OPENROUTER_API_KEY",
  "GOOGLE_AI_API_KEY",
  "HF_TOKEN",
  "MISTRAL_API_KEY",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "OLLAMA_ENABLED",
  "OLLAMA_HOST",
  "OLLAMA_DEFAULT_MODEL",
  "VERCEL_TOKEN",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID",
  "AGENT_DISPLAY_NAME",
]);

// Lets each install rename the assistant away from "ANu" — required on the
// sellable build (see lib/config/buildVariant.ts), since buyers don't get
// the personal ANu model/branding and should be able to name their own.
// Defaults to "ANu" so the personal build's behavior is unchanged.
export function getAgentDisplayName(): string {
  return getRuntimeConfig()["AGENT_DISPLAY_NAME"]?.trim() || "ANu";
}

// Cloudflare Workers AI needs both a token AND an account id to form its base
// URL — read separately from getProviderKey() since that helper assumes a
// single key per provider.
export function getCloudflareAccountId(): string | undefined {
  return getRuntimeConfig()["CLOUDFLARE_ACCOUNT_ID"];
}

export function readRuntimeStore(): Record<string, string> {
  return readConfigFile();
}

export function writeRuntimeStore(data: Record<string, string>): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Provider id (as used by ProviderManager / the UI) -> the env var it reads.
// Single source of truth shared by the API route, the Settings UI contract,
// and getProviderKey() above.
export const PROVIDER_ENV_VAR: { [provider: string]: string } = {
  groq: "GROQ_API_KEY",
  cerebras: "CEREBRAS_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  gemini: "GOOGLE_AI_API_KEY",
  huggingface: "HF_TOKEN",
  mistral: "MISTRAL_API_KEY",
  cloudflare: "CLOUDFLARE_API_TOKEN",
};
