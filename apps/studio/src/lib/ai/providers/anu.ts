// ============================================================================
// AN Dev Studio — ANu Provider
// "AN Universal" — in-house AI running on Ollama (zero API cost, fully private)
//
// Setup: run `anu/setup.ps1` (Windows) or `anu/setup.sh` (Linux/Mac)
// Then add OLLAMA_ENABLED=true to .env.local
// ============================================================================

import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";

export class AnuProvider extends OpenAICompatProvider {
    readonly name    = "anu";
    readonly label   = "ANu (In-house)";
    readonly baseUrl: string;
    readonly apiKey  = ""; // Ollama requires no API key
    readonly defaultModel: string;

    readonly models: ModelInfo[] = [
        { id: "anu",               name: "ANu (Custom)",      contextLength: 8192,   description: "Your fine-tuned in-house model",         free: true },
        { id: "qwen2.5-coder:7b",  name: "Qwen 2.5 Coder 7B", contextLength: 32768,  description: "Best for code generation",              free: true },
        { id: "llama3.1:8b",       name: "Llama 3.1 8B",      contextLength: 128000, description: "Balanced quality & speed",              free: true },
        { id: "llama3.1:70b",      name: "Llama 3.1 70B",     contextLength: 128000, description: "Best quality (requires ~40GB VRAM)",    free: true },
        { id: "codellama:13b",     name: "CodeLlama 13B",     contextLength: 16384,  description: "Code-specialized, strong performance",  free: true },
        { id: "mistral:7b",        name: "Mistral 7B",        contextLength: 32768,  description: "Fast & capable general model",          free: true },
        { id: "deepseek-coder:6.7b", name: "DeepSeek Coder 6.7B", contextLength: 16384, description: "Excellent at code completion",      free: true },
    ];

    constructor() {
        super();
        this.baseUrl     = `${process.env.OLLAMA_HOST ?? "http://localhost:11434"}/v1`;
        this.defaultModel = process.env.OLLAMA_DEFAULT_MODEL ?? "anu";
    }

    // ANu is enabled when the operator explicitly turns it on in .env.local
    // This prevents latency from failed connection attempts when Ollama isn't running
    isAvailable(): boolean {
        return process.env.OLLAMA_ENABLED === "true";
    }

    // Ollama accepts empty or any string for the Bearer token
    extraHeaders(): Record<string, string> {
        return {};
    }
}
