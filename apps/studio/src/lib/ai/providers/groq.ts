import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";

export class GroqProvider extends OpenAICompatProvider {
    readonly name = "groq";
    readonly label = "Groq";
    readonly baseUrl = "https://api.groq.com/openai/v1";
    readonly apiKey: string;
    readonly defaultModel = "llama-3.3-70b-versatile";

    readonly models: ModelInfo[] = [
        { id: "llama-3.3-70b-versatile",    name: "Llama 3.3 70B",       contextLength: 128000, description: "Best quality, fast",      free: true },
        { id: "llama-3.1-8b-instant",        name: "Llama 3.1 8B Instant", contextLength: 128000, description: "Fastest, lower quality", free: true },
        { id: "mixtral-8x7b-32768",          name: "Mixtral 8x7B",         contextLength: 32768,  description: "Strong reasoning",       free: true },
        { id: "gemma2-9b-it",                name: "Gemma 2 9B",           contextLength: 8192,   description: "Google's Gemma model",   free: true },
        { id: "llama-3.1-70b-versatile",     name: "Llama 3.1 70B",        contextLength: 128000, description: "Previous gen 70B",       free: true },
    ];

    constructor() {
        super();
        this.apiKey = process.env.GROQ_API_KEY ?? "";
    }
}
