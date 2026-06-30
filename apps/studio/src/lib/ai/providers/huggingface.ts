import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";

// HuggingFace Inference API — OpenAI-compatible endpoint
// Free tier available at https://huggingface.co/settings/tokens
export class HuggingFaceProvider extends OpenAICompatProvider {
    readonly name = "huggingface";
    readonly label = "HuggingFace";
    readonly baseUrl = "https://api-inference.huggingface.co/v1";
    readonly apiKey: string;
    readonly defaultModel = "mistralai/Mistral-7B-Instruct-v0.3";

    readonly models: ModelInfo[] = [
        { id: "mistralai/Mistral-7B-Instruct-v0.3",   name: "Mistral 7B",     contextLength: 32768, description: "Reliable free model",    free: true },
        { id: "microsoft/Phi-3-mini-4k-instruct",      name: "Phi-3 Mini 4K",  contextLength: 4096,  description: "Microsoft Phi-3",        free: true },
        { id: "HuggingFaceH4/zephyr-7b-beta",          name: "Zephyr 7B Beta", contextLength: 8192,  description: "HF fine-tuned Mistral",  free: true },
    ];

    constructor() {
        super();
        this.apiKey = process.env.HF_TOKEN ?? "";
    }
}
