import type { HistoryItem } from "../types";

interface HistoryPanelProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
}

export default function HistoryPanel({
    history,
    onSelect,
}: HistoryPanelProps) {
    return (
        <div
            style={{
                marginTop: "24px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                background: "#ffffff",
            }}
        >
            <h3>Recent Requests</h3>

            {history.length === 0 ? (
                <p
                    style={{
                        color: "#6b7280",
                    }}
                >
                    No history yet.
                </p>
            ) : (
                history.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(item)}
                        style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "12px",
                            marginTop: "10px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            background: "#f9fafb",
                            cursor: "pointer",
                        }}
                    >
                        <strong>Prompt:</strong>

                        <div
                            style={{
                                marginTop: "6px",
                                color: "#374151",
                            }}
                        >
                            {item.prompt}
                        </div>
                    </button>
                ))
            )}
        </div>
    );
}