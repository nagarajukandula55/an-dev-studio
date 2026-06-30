import * as fs from "fs";
import * as path from "path";

const CONFIG_PATH = path.join(process.cwd(), "config", "runtime.json");

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

const PROVIDER_KEY_MAP: { [provider: string]: string } = {
  groq: "GROQ_API_KEY",
  cerebras: "CEREBRAS_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  gemini: "GOOGLE_AI_API_KEY",
  huggingface: "HF_TOKEN",
};

export function getProviderKey(providerName: string): string | undefined {
  const envKey = PROVIDER_KEY_MAP[providerName.toLowerCase()];
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
