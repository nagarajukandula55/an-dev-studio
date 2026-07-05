import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";
import { getProviderKey } from "@/lib/configStore";

export class CerebrasProvider extends OpenAICompatProvider {
    readonly name = "cerebras";
    readonly label = "Cerebras";
    readonly defaultModel = "llama3.1-70b";

    readonly models: ModelInfo[] = [
        { id: "llama3.1-70b", name: "Llama 3.1 70B", contextLength: 128000, description: "Ultra-fast 70B inference", free: true },
        { id: "llama3.1-8b",  name: "Llama 3.1 8B",  contextLength: 128000, description: "Fastest possible inference", free: true },
    ];

    getApiKey(): string {
        return getProviderKey("cerebras") ?? "";
    }

    getBaseUrl(): string {
        return "https://api.cerebras.ai/v1";
    }
}
