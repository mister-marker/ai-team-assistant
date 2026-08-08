import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
    onSubmit: (prompt: string) => void;
    loading: boolean;
}

export default function ChatInput({
    onSubmit,
    loading,
}: ChatInputProps) {
    const [prompt, setPrompt] = useState("");

    function handleSubmit() {
        if (!prompt.trim()) {
            return;
        }

        onSubmit(prompt);
        setPrompt("");
    }

    function handleKeyDown(
        event: KeyboardEvent<HTMLTextAreaElement>,
    ) {
        if (event.key === "Enter" && event.ctrlKey) {
            event.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "24px",
            }}
        >
            <textarea
                rows={6}
                placeholder="Ask your AI assistant..."
                value={prompt}
                onChange={(event) =>
                    setPrompt(event.target.value)
                }
                onKeyDown={handleKeyDown}
                style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    resize: "vertical",
                    fontSize: "15px",
                }}
            />

            <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#4f46e5",
                    color: "white",
                    fontWeight: 600,
                    cursor: loading ? "default" : "pointer",
                }}
            >
                {loading ? "Thinking..." : "Ask AI"}
            </button>

            <small
                style={{
                    color: "#6b7280",
                }}
            >
                Tip: Press <strong>Ctrl + Enter</strong> to send your
                request.
            </small>
        </div>
    );
}