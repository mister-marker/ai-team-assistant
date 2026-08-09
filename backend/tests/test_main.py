import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main  # noqa: E402


client = TestClient(main.app)


@pytest.fixture(autouse=True)
def clear_history() -> None:
    main.history.clear()


def test_health_does_not_call_llm() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_validation_error_has_safe_contract() -> None:
    response = client.post(
        "/chat",
        json={"prompt": "", "mode": "brainstormer"},
    )

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["request_id"]


def test_invalid_mode_has_safe_contract() -> None:
    response = client.post(
        "/chat",
        json={"prompt": "hello", "mode": "unknown"},
    )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_provider_failure_does_not_leak_exception(monkeypatch: pytest.MonkeyPatch) -> None:
    async def failing_llm(*, mode: str, prompt: str) -> str:
        raise RuntimeError("secret provider details")

    monkeypatch.setattr(main, "ask_llm", failing_llm)

    response = client.post(
        "/chat",
        json={"prompt": "hello", "mode": "brainstormer"},
    )

    assert response.status_code == 502
    body = response.json()
    assert body["error"]["code"] == "LLM_PROVIDER_ERROR"
    assert "secret provider details" not in response.text


def test_history_keeps_five_newest_items(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_llm(*, mode: str, prompt: str) -> str:
        return f"answer:{prompt}"

    monkeypatch.setattr(main, "ask_llm", fake_llm)

    for index in range(6):
        response = client.post(
            "/chat",
            json={"prompt": f"prompt-{index}", "mode": "brainstormer"},
        )
        assert response.status_code == 200

    history = client.get("/history")
    assert history.status_code == 200
    items = history.json()
    assert len(items) == 5
    assert [item["prompt"] for item in items] == [
        "prompt-5",
        "prompt-4",
        "prompt-3",
        "prompt-2",
        "prompt-1",
    ]
    assert items[0]["mode"] == "brainstormer"
    assert items[0]["id"]
    assert items[0]["created_at"]
