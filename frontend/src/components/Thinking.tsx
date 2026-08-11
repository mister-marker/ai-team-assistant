import patrick from "../assets/patrick-thinking.gif";

const messages = [
    "Патрик думает. Это серьезно...",
    "Собираю ответ без лишней воды...",
    "Проверяю структуру и формулировки...",
    "Ищу самый полезный вариант ответа...",
    "Почти готово...",
];

const randomMessage =
    messages[Math.floor(Math.random() * messages.length)];

export default function Thinking() {
    return (
        <div className="thinking-state">
            <img
                src={patrick}
                alt="Patrick is thinking..."
                width={176}
            />

            <h3>{randomMessage}</h3>

            <p>
                AI готовит аккуратный ответ для команды.
            </p>
        </div>
    );
}
