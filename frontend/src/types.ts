export type AssistantMode =
    | "brainstormer"
    | "code-reviewer"
    | "product-manager"
    | "technical-writer";

export interface ChatRequest {
    prompt: string;
    mode: AssistantMode;
}

export interface ChatResponse {
    answer: string;
}

export interface HistoryItem {
    id: string;
    mode: AssistantMode;
    prompt: string;
    answer: string;
    created_at: string;
}
