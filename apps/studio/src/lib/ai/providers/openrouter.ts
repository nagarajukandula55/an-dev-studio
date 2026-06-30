import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";

export class OpenRouterProvider extends OpenAICompatProvider {
    readonly name = "openrouter";
    readonly label = "OpenRouter";
    readonly baseUrl = "https://openrouter.ai/api/v1";
    readonly apiKey: string;
    readonly defaultModel = "meta-llama/llama-3.2-3b-instruct:free";

    readonly models: ModelInfo[] = [
        { id: "meta-llama/llama-3.1-8b-instruct:free",  name: "Llama 3.1 8B (Free)",   contextLength: 131072, description: "Free Meta Llama",      free: true },
        { id: "meta-llama/llama-3.2-3b-instruct:free",  name: "Llama 3.2 3B (Free)",   contextLength: 131072, description: "Smallest free model",   free: true },
        { id: "google/gemma-2-9b-it:free",               name: "Gemma 2 9B (Free)",     contextLength: 8192,   description: "Google Gemma free",     free: true },
        { id: "mistralai/mistral-7b-instruct:free",      name: "Mistral 7B (Free)",     contextLength: 32768,  description: "Mistral free tier",     free: true },
        { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini (Free)",     contextLength: 128000, description: "Microsoft Phi-3 free",  free: true },
    ];

    constructor() {
        super();
        this.apiKey = process.env.OPENROUTER_API_KEY ?? "";
    }

    extraHeaders(): Record<string, string> {
        return {
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://an-dev-studio.vercel.app",
            "X-Title": "AN Dev Studio",
        };
    }
}
