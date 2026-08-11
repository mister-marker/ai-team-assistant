import { useState } from "react";

import type { KeyboardEvent } from "react";

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
        const normalizedPrompt = prompt.trim();

        if (!normalizedPrompt || loading) {
            return;
        }

        onSubmit(normalizedPrompt);
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
        <div className="composer">
            <textarea
                rows={5}
                aria-label="Вопрос для ассистента"
                placeholder="Введите вопрос для ассистента..."
                value={prompt}
                onChange={(event) =>
                    setPrompt(event.target.value)
                }
                onKeyDown={handleKeyDown}
            />

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="primary-button"
            >
                {loading ? "Думаю..." : "Спросить AI"}
            </button>
        </div>
    );
}
