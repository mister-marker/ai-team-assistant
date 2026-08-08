import { useState } from "react";

interface ChatMessageProps {
    answer: string;
}

export default function ChatMessage({
    answer,
}: ChatMessageProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(answer);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    if (!answer) {
        return null;
    }

    return (
        <div
            style={{
                marginTop: "24px",
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
            }}
        >
            <h3>AI Response</h3>

            <div
                style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    marginBottom: "18px",
                }}
            >
                {answer}
            </div>

            <button
                onClick={handleCopy}
                style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#4f46e5",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                }}
            >
                {copied ? "✓ Copied" : "Copy Answer"}
            </button>
        </div>
    );
}