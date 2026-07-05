import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";
import { getProviderKey } from "@/lib/configStore";

export class OpenRouterProvider extends OpenAICompatProvider {
    readonly name = "openrouter";
    readonly label = "OpenRouter";
    readonly defaultModel = "meta-llama/llama-3.2-3b-instruct:free";

    // OpenRouter proxies a much larger free catalog than this; this is a
    // curated, reliably-free starter set surfaced in the Settings UI.
    // Users can also type any OpenRouter model id ending in ":free" directly.
    readonly models: ModelInfo[] = [
        { id: "meta-llama/llama-3.1-8b-instruct:free",  name: "Llama 3.1 8B (Free)",   contextLength: 131072, description: "Free Meta Llama",      free: true },
        { id: "meta-llama/llama-3.2-3b-instruct:free",  name: "Llama 3.2 3B (Free)",   contextLength: 131072, description: "Smallest free model",   free: true },
        { id: "google/gemma-2-9b-it:free",               name: "Gemma 2 9B (Free)",     contextLength: 8192,   description: "Google Gemma free",     free: true },
        { id: "mistralai/mistral-7b-instruct:free",      name: "Mistral 7B (Free)",     contextLength: 32768,  description: "Mistral free tier",     free: true },
        { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini (Free)",     contextLength: 128000, description: "Microsoft Phi-3 free",  free: true },
        { id: "qwen/qwen-2.5-72b-instruct:free",         name: "Qwen 2.5 72B (Free)",   contextLength: 32768,  description: "Strong free 72B model", free: true },
        { id: "deepseek/deepseek-chat:free",             name: "DeepSeek Chat (Free)",  contextLength: 64000,  description: "Free DeepSeek chat model", free: true },
    ];

    getApiKey(): string {
        return getProviderKey("openrouter") ?? "";
    }

    getBaseUrl(): string {
        return "https://openrouter.ai/api/v1";
    }

    extraHeaders(): Record<string, string> {
        return {
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://an-dev-studio.vercel.app",
            "X-Title": "AN Dev Studio",
        };
    }
}
