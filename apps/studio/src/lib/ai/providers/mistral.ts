import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";
import { getProviderKey } from "@/lib/configStore";

// Mistral's "La Plateforme" enables a rate-limited free tier by default for
// new accounts (no card required) — see https://docs.mistral.ai. Limits are
// per-workspace and can change, so isAvailable() only checks that a key is
// configured; actual quota enforcement happens on Mistral's side and surfaces
// as a normal HTTP error the fallback chain will catch.
export class MistralProvider extends OpenAICompatProvider {
    readonly name = "mistral";
    readonly label = "Mistral AI";
    readonly defaultModel = "mistral-small-latest";

    readonly models: ModelInfo[] = [
        { id: "mistral-small-latest", name: "Mistral Small",  contextLength: 128000, description: "Free-tier friendly, strong for its size", free: true },
        { id: "open-mistral-nemo",    name: "Mistral Nemo 12B", contextLength: 128000, description: "Open-weight, fast",                       free: true },
        { id: "mistral-large-latest", name: "Mistral Large",  contextLength: 128000, description: "Flagship quality, tighter free-tier limits", free: true },
    ];

    getApiKey(): string {
        return getProviderKey("mistral") ?? "";
    }

    getBaseUrl(): string {
        return "https://api.mistral.ai/v1";
    }
}
