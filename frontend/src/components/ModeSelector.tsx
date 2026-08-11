import type { AssistantMode } from "../types";

type Mode =
    AssistantMode;

interface ModeSelectorProps {
    value: Mode;
    onChange: (mode: Mode) => void;
}

const modes: {
    value: Mode;
    label: string;
    icon: string;
    description: string;
}[] = [
    {
        value: "brainstormer",
        label: "Brainstormer",
        icon: "🧠",
        description: "Идеи, названия, гипотезы и варианты решения.",
    },
    {
        value: "code-reviewer",
        label: "Code Reviewer",
        icon: "💻",
        description: "Баги, архитектура, риски и улучшения кода.",
    },
    {
        value: "product-manager",
        label: "Product Manager",
        icon: "📦",
        description: "MVP, требования, приоритеты и метрики.",
    },
    {
        value: "technical-writer",
        label: "Technical Writer",
        icon: "✍️",
        description: "README, инструкции и понятная документация.",
    },
];

export default function ModeSelector({
    value,
    onChange,
}: ModeSelectorProps) {
    return (
        <div className="mode-grid">
            {modes.map((mode) => (
                <button
                    key={mode.value}
                    type="button"
                    aria-pressed={value === mode.value}
                    className={
                        value === mode.value
                            ? "mode-card mode-card-active"
                            : "mode-card"
                    }
                    onClick={() => onChange(mode.value)}
                >
                    <span className="mode-icon" aria-hidden="true">
                        {mode.icon}
                    </span>

                    <span className="mode-copy">
                        <strong>{mode.label}</strong>
                        <span>{mode.description}</span>
                    </span>
                </button>
            ))}
        </div>
    );
}
