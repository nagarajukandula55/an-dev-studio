// ============================================================================
// AN Dev Studio — AI Provider Types
// ============================================================================

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ModelInfo {
    id: string;
    name: string;
    contextLength: number;
    description: string;
    free: boolean;
}

export interface StreamChunk {
    type: "token" | "done" | "error" | "provider_switch";
    token?: string;
    error?: string;
    provider: string;
    model: string;
    isFallback?: boolean;
    switchingFrom?: string;
    switchingTo?: string;
}

export type ChatStreamCallback = (chunk: StreamChunk) => void;

export interface IProvider {
    readonly name: string;
    readonly label: string;
    readonly defaultModel: string;
    readonly models: ModelInfo[];
    isAvailable(): boolean;
    chat(
        messages: ChatMessage[],
        model: string,
        onChunk: ChatStreamCallback,
        signal?: AbortSignal,
    ): Promise<string>;
}

export interface ProviderStatus {
    name: string;
    label: string;
    configured: boolean;
    models: ModelInfo[];
    defaultModel: string;
}

export interface ChatRequest {
    messages: ChatMessage[];
    agentType?: string;
    provider?: string;
    model?: string;
}

export interface ChatResponse {
    fullText: string;
    provider: string;
    model: string;
    isFallback: boolean;
}
