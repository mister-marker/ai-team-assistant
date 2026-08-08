import { useEffect, useState } from "react";

import "./App.css";

import { askAI, getHistory } from "./api";

import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import HistoryPanel from "./components/HistoryPanel";
import ModeSelector from "./components/ModeSelector";
import Thinking from "./components/Thinking";

import type { HistoryItem, AssistantMode } from "./types";

export default function App() {
    const [mode, setMode] =
        useState<AssistantMode>("brainstormer");

    const [answer, setAnswer] =
        useState("");

    const [history, setHistory] =
        useState<HistoryItem[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    async function loadHistory(): Promise<void> {
        const items = await getHistory();
        setHistory(items);
    }

    useEffect(() => {
        let isMounted = true;

        getHistory()
            .then((items) => {
                if (isMounted) {
                    setHistory(items);
                }
            })
            .catch((error: unknown) => {
                if (!isMounted) {
                    return;
                }

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load history.",
                );
            });

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleSubmit(prompt: string) {
        if (loading) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await askAI({
                prompt,
                mode,
            });

            setAnswer(response.answer);

            await loadHistory();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unexpected error.");
            }
        } finally {
            setLoading(false);
        }
    }

    function handleHistory(item: HistoryItem) {
        setAnswer(item.answer);
    }

    return (
        <main className="container">
            <header className="header">
                <h1>🤖 AI Team Assistant</h1>

                <p>
                    A lightweight dashboard powered by
                    FastAPI + React + OpenAI-compatible API.
                </p>
            </header>

            <section className="card">
                <ModeSelector
                    value={mode}
                    onChange={setMode}
                />

                <ChatInput
                    loading={loading}
                    onSubmit={handleSubmit}
                />

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <Thinking />
                ) : (
                    <ChatMessage answer={answer} /> 
                )} 
            </section>

            <section className="card">
                <HistoryPanel
                    history={history}
                    onSelect={handleHistory}
                />
            </section>
        </main>
    );
}
