import type { ModelInfo } from "../types";
import { OpenAICompatProvider } from "./openaiCompat";
import { getProviderKey, getCloudflareAccountId } from "@/lib/configStore";

// Cloudflare Workers AI gives every account a genuinely-free daily allocation
// (10,000 "Neurons" per day, resets 00:00 UTC — no card required) via an
// OpenAI-compatible endpoint. Unlike the other providers this needs BOTH an
// API token and an account id to form its base URL, so isAvailable() checks
// both are present.
export class CloudflareProvider extends OpenAICompatProvider {
    readonly name = "cloudflare";
    readonly label = "Cloudflare Workers AI";
    readonly defaultModel = "@cf/meta/llama-3.1-8b-instruct";

    readonly models: ModelInfo[] = [
        { id: "@cf/meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", contextLength: 128000, description: "Fast, free daily allocation", free: true },
        { id: "@cf/openai/gpt-oss-120b",         name: "GPT-OSS 120B", contextLength: 128000, description: "Larger open model, uses more of the daily quota", free: true },
    ];

    isAvailable(): boolean {
        return Boolean(this.getApiKey()) && Boolean(getCloudflareAccountId());
    }

    getApiKey(): string {
        return getProviderKey("cloudflare") ?? "";
    }

    getBaseUrl(): string {
        const accountId = getCloudflareAccountId() ?? "";
        return `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`;
    }
}
