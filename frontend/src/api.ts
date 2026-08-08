import type {
    ChatRequest,
    ChatResponse,
    HistoryItem,
} from "./types";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function askAI(
    request: ChatRequest,
): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(
            error?.detail ?? "Failed to contact AI service.",
        );
    }

    return (await response.json()) as ChatResponse;
}

export async function getHistory(): Promise<HistoryItem[]> {
    const response = await fetch(
        `${API_BASE_URL}/history`,
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load history.",
        );
    }

    return (await response.json()) as HistoryItem[];
}