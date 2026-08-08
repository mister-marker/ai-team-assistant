import { useState } from "react";

import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
    answer: string;
}

export default function ChatMessage({
    answer,
}: ChatMessageProps) {
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");

    async function handleCopy() {
        setCopyError("");

        try {
            if (!navigator.clipboard) {
                throw new Error("Clipboard API is unavailable.");
            }

            await navigator.clipboard.writeText(answer);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            setCopyError("Copy is unavailable in this browser.");
        }
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

            <div className="markdown-content">
                <ReactMarkdown>{answer}</ReactMarkdown>
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

            {copyError && (
                <p className="copy-error" role="alert">
                    {copyError}
                </p>
            )}
        </div>
    );
}
