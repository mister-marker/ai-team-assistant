type Mode =
    | "brainstormer"
    | "code-reviewer"
    | "product-manager"
    | "technical-writer";

interface ModeSelectorProps {
    value: Mode;
    onChange: (mode: Mode) => void;
}

const modes: {
    value: Mode;
    label: string;
    icon: string;
}[] = [
    {
        value: "brainstormer",
        label: "Brainstormer",
        icon: "🧠",
    },
    {
        value: "code-reviewer",
        label: "Code Reviewer",
        icon: "💻",
    },
    {
        value: "product-manager",
        label: "Product Manager",
        icon: "📦",
    },
    {
        value: "technical-writer",
        label: "Technical Writer",
        icon: "✍️",
    },
];

export default function ModeSelector({
    value,
    onChange,
}: ModeSelectorProps) {
    return (
        <div
            style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "20px",
            }}
        >
            {modes.map((mode) => (
                <button
                    key={mode.value}
                    onClick={() => onChange(mode.value)}
                    style={{
                        padding: "10px 18px",
                        borderRadius: "12px",
                        border:
                            value === mode.value
                                ? "2px solid #4f46e5"
                                : "1px solid #d1d5db",
                        background:
                            value === mode.value
                                ? "#eef2ff"
                                : "#ffffff",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    {mode.icon} {mode.label}
                </button>
            ))}
        </div>
    );
}