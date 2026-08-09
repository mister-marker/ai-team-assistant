"""
LLM integration layer.

Responsible for:
- loading environment variables
- storing assistant system prompts
- communicating with an OpenAI-compatible API
"""
import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables from .env
load_dotenv()

BASE_URL = os.getenv("BASE_URL")
API_KEY = os.getenv("API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")
LLM_TIMEOUT_SECONDS = float(os.getenv("LLM_TIMEOUT_SECONDS", "45"))

DEFAULT_MODE = "brainstormer"
DEFAULT_TEMPERATURE = 0.7
MAX_OUTPUT_TOKENS = 2000

# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------

SYSTEM_PROMPTS: dict[str, str] = {
    "code-reviewer": (
        "Ты — Staff Software Engineer с фокусом на качестве кода и архитектуре. "
        "Ты проводишь код-ревью по стандартам PEP 8, SOLID, KISS, DRY, YAGNI и "
        "The Twelve-Factor App. "
        "Ищи баги, потенциальные проблемы безопасности, неоптимальные алгоритмы, "
        "отсутствие обработки ошибок и плохую читаемость кода. "
        "Формат ответа (Markdown): "
        "1. Общая оценка; "
        "2. 🔴 Критические проблемы; "
        "3. 🟡 Замечания; "
        "4. 🟢 Рекомендации с примерами кода; "
        "5. Полезные ссылки на best practices."
    ),
    "product-manager": (
        "Ты — Senior Product Manager. "
        "Используй Product Thinking, User Story Mapping, RICE, MoSCoW, "
        "Kano Model и Lean Canvas. "
        "Помогай формулировать требования, MVP, User Stories, Acceptance Criteria "
        "и продуктовые гипотезы. "
        "Формат ответа (Markdown): "
        "1. Проблема; "
        "2. Решение; "
        "3. User Story; "
        "4. Приоритет; "
        "5. Метрики успеха."
    ),
    "technical-writer": (
        "Ты — опытный технический писатель. "
        "Создавай понятную документацию, README, API Docs, инструкции "
        "и технические статьи. "
        "Пиши кратко, структурировано и без воды. "
        "Используй Markdown с заголовками, списками и примерами."
    ),
    "brainstormer": (
        "Ты — креативный AI-помощник. "
        "Используй техники Design Thinking, First Principles, SCAMPER и "
        "Six Thinking Hats для генерации идей. "
        "Предлагай несколько вариантов решения, оценивай их плюсы и минусы "
        "и заканчивай рекомендацией."
    ),
}


def _get_client() -> AsyncOpenAI:
    """Create and return an OpenAI-compatible async client."""
    if not API_KEY or not BASE_URL:
        raise RuntimeError(
            "Missing required environment variables. "
            "Please configure API_KEY and BASE_URL in the .env file."
        )

    return AsyncOpenAI(
        api_key=API_KEY,
        base_url=BASE_URL,
        timeout=LLM_TIMEOUT_SECONDS,
        max_retries=0,
    )


async def ask_llm(mode: str, prompt: str) -> str:
    """
    Send a prompt to the configured LLM.

    Args:
        mode: Assistant mode (code-reviewer, product-manager, etc.).
        prompt: User question.

    Returns:
        AI-generated response as a Markdown string.
    Raises:
        RuntimeError: If MODEL_NAME is not configured.
    """

    if not MODEL_NAME:
        raise RuntimeError(
            "MODEL_NAME is not configured. "
            "Please set MODEL_NAME in the .env file."
        )

    system_prompt = SYSTEM_PROMPTS.get(
        mode,
        SYSTEM_PROMPTS[DEFAULT_MODE],
    )

    client = _get_client()

    response = await client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=DEFAULT_TEMPERATURE,
        max_tokens=MAX_OUTPUT_TOKENS,
    )

    if not response.choices:
        raise RuntimeError("LLM provider returned no choices.")

    return response.choices[0].message.content or ""
