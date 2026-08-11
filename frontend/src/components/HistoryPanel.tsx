import type { HistoryItem } from "../types";

const modeLabels: Record<HistoryItem["mode"], string> = {
    "brainstormer": "Brainstormer",
    "code-reviewer": "Code Reviewer",
    "product-manager": "Product Manager",
    "technical-writer": "Technical Writer",
};

interface HistoryPanelProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
}

export default function HistoryPanel({
    history,
    onSelect,
}: HistoryPanelProps) {
    return (
        <div className="history-panel">
            <div className="section-heading compact">
                <div>
                    <span className="eyebrow">
                        Последние запросы
                    </span>

                    <h2 id="history-title">
                        История
                    </h2>
                </div>
            </div>

            {history.length === 0 ? (
                <p className="empty-state">
                    Здесь появятся последние успешные запросы.
                </p>
            ) : (
                <div className="history-list">
                    {history.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item)}
                            className="history-item"
                        >
                            <div className="history-meta">
                                <span>{modeLabels[item.mode]}</span>
                                <time dateTime={item.created_at}>
                                    {new Date(
                                        item.created_at,
                                    ).toLocaleString()}
                                </time>
                            </div>

                            <strong>Запрос</strong>

                            <p>
                                {item.prompt}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
