import patrick from "../assets/patrick-thinking.gif";

const messages = [
    "🧠 Patrick and SpongeBob are brainstorming...",
    "⭐ SpongeBob is explaining. Patrick is listening carefully...",
    "🪼 Asking the jellyfish for expert advice...",
    "💡 SpongeBob has an idea. Patrick is thinking about it...",
    "🍍 Meeting at the Pineapple HQ...",
    "🍔 Brain fuel acquired. Generating the answer...",
    "🌊 Searching Bikini Bottom for inspiration...",
    "🐚 Almost there...",
    "🤖 Combining AI intelligence with Bikini Bottom wisdom...",
];

const randomMessage =
    messages[Math.floor(Math.random() * messages.length)];

export default function Thinking() {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "40px",
            }}
        >
            <img
                src={patrick}
                alt="Patrick is thinking..."
                width={180}
            />

            <h3
                style={{
                    marginTop: "20px",
                }}
            >
                {randomMessage}
            </h3>

            <p
                style={{
                    color: "#666",
                }}
            >
                AI is generating the best answer for you.
            </p>
        </div>
    );
}