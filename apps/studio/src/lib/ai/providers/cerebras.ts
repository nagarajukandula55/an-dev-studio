import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";

export class CerebrasProvider extends OpenAICompatProvider {
    readonly name = "cerebras";
    readonly label = "Cerebras";
    readonly baseUrl = "https://api.cerebras.ai/v1";
    readonly apiKey: string;
    readonly defaultModel = "llama3.1-70b";

    readonly models: ModelInfo[] = [
        { id: "llama3.1-70b", name: "Llama 3.1 70B", contextLength: 128000, description: "Ultra-fast 70B inference", free: true },
        { id: "llama3.1-8b",  name: "Llama 3.1 8B",  contextLength: 128000, description: "Fastest possible inference", free: true },
    ];

    constructor() {
        super();
        this.apiKey = process.env.CEREBRAS_API_KEY ?? "";
    }
}
