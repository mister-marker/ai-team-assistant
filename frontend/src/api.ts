import type {
    ChatRequest,
    ChatResponse,
    HistoryItem,
} from "./types";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    "http://127.0.0.1:8000";

async function getErrorMessage(response: Response): Promise<string> {
    const error = await response.json().catch(() => null);

    if (typeof error?.detail === "string") {
        return error.detail;
    }

    if (typeof error?.error?.message === "string") {
        return error.error.message;
    }

    return "Failed to contact AI service.";
}

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
        throw new Error(await getErrorMessage(response));
    }

    return (await response.json()) as ChatResponse;
}

export async function getHistory(): Promise<HistoryItem[]> {
    const response = await fetch(
        `${API_BASE_URL}/history`,
    );

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return (await response.json()) as HistoryItem[];
}
