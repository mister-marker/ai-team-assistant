import { useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
            setCopyError("Копирование недоступно в этом браузере.");
        }
    }

    if (!answer) {
        return null;
    }

    return (
        <article className="response-card">
            <div className="response-header">
                <div>
                    <span className="eyebrow">Готовый результат</span>
                    <h3>Ответ ассистента</h3>
                </div>

                <span className="status-pill">
                    Markdown
                </span>
            </div>

            <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                </ReactMarkdown>
            </div>

            <button
                type="button"
                onClick={handleCopy}
                className="secondary-button"
            >
                {copied ? "Скопировано" : "Копировать ответ"}
            </button>

            {copyError && (
                <p className="copy-error" role="alert">
                    {copyError}
                </p>
            )}
        </article>
    );
}
